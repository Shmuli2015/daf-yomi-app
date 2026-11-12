import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getSettings } from '../db/database';
import { scheduleNotifications } from '../utils/notifications';
import {
  reminderModeFromSettings,
  schedulesForReminderSettings,
} from '../utils/reminderSchedule';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from '../utils/notificationPermission';
import { dismissStuckStudyReminders } from '../utils/dismissStuckStudyReminders';
import { getNotificationIdFromActionData } from '../utils/dismissReminderFromTray';
import { handleStudyReminderResponse } from '../utils/handleStudyReminderResponse';
import { extendStudyReminders } from '../utils/extendStudyReminders';
import { captureException } from '../services/sentry';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const SCHEDULE_MARKER = `${FileSystem.documentDirectory ?? ''}notification-schedule.json`;

function reminderSignature(settings: ReturnType<typeof getSettings>): string {
  return JSON.stringify({
    hour: settings.notification_hour,
    minute: settings.notification_minute,
    mode: settings.notif_mode,
    enabled: settings.notifications_enabled,
    sound: settings.notification_sound_enabled,
    schedules: settings.day_schedules,
  });
}

async function wasScheduledToday(signature: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(SCHEDULE_MARKER);
    if (!info.exists) {
      return false;
    }
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(SCHEDULE_MARKER)) as {
      day?: string;
      signature?: string;
    };
    return parsed.day === format(new Date(), 'yyyy-MM-dd') && parsed.signature === signature;
  } catch {
    return false;
  }
}

async function markScheduledToday(signature: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(
      SCHEDULE_MARKER,
      JSON.stringify({ day: format(new Date(), 'yyyy-MM-dd'), signature }),
    );
  } catch {
  }
}

export function useNotificationsSetup() {
  const responseSubRef = useRef<EventSubscription | undefined>(undefined);
  const receivedSubRef = useRef<EventSubscription | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const onResponse = (response: Notifications.NotificationResponse) => {
      void handleStudyReminderResponse({
        actionIdentifier: response.actionIdentifier,
        notificationId: getNotificationIdFromActionData(response) || response.notification?.request?.identifier,
        response,
      });
    };

    responseSubRef.current?.remove();
    responseSubRef.current = Notifications.addNotificationResponseReceivedListener(onResponse);

    receivedSubRef.current?.remove();
    receivedSubRef.current = Notifications.addNotificationReceivedListener(() => {
      void extendStudyReminders().catch(captureException);
    });

    try {
      const initialResponse = Notifications.getLastNotificationResponse();
      if (initialResponse && !cancelled) {
        Notifications.clearLastNotificationResponse();
        onResponse(initialResponse);
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('getLastNotificationResponse failed:', error);
      }
    }

    void (async () => {
      try {
        if (isExpoGo && __DEV__) {
          console.log('Running in Expo Go - Push notifications (remote) are restricted.');
        }

        if (Platform.OS === 'android' && !isExpoGo) {
          try {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'תזכורות לימוד',
              description: 'תזכורות יומיות ללימוד הדף היומי',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          } catch (channelError) {
            captureException(channelError);
          }
        }

        const s = getSettings();
        let status = await getNotificationPermissionStatus();
        if (cancelled) return;

        if (status === 'undetermined' && s.notifications_enabled === 1) {
          status = await requestNotificationPermission();
          if (cancelled) return;
        }

        if (status === 'granted') {
          const signature = reminderSignature(s);
          const skip = s.notifications_enabled === 1 && (await wasScheduledToday(signature));
          if (!skip) {
            const reminderMode = reminderModeFromSettings(s.notif_mode);
            await scheduleNotifications(
              s.notification_hour,
              s.notification_minute,
              reminderMode,
              schedulesForReminderSettings(s.day_schedules, reminderMode),
              s.notifications_enabled === 1,
              { sound: s.notification_sound_enabled !== 0 },
            );
            if (s.notifications_enabled === 1) {
              await markScheduledToday(signature);
            }
          }
        }

        if (cancelled) return;

        await dismissStuckStudyReminders();
      } catch (e) {
        captureException(e);
      }
    })();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void dismissStuckStudyReminders();
      }
    };
    const appStateSub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      cancelled = true;
      appStateSub.remove();
      responseSubRef.current?.remove();
      responseSubRef.current = undefined;
      receivedSubRef.current?.remove();
      receivedSubRef.current = undefined;
    };
  }, []);
}
