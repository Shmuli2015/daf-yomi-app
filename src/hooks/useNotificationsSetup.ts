import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getSettings } from '../db/database';
import { scheduleNotifications, DEFAULT_SCHEDULES, DaySchedule } from '../utils/notifications';
import { useAppStore } from '../store/useAppStore';
import { getNotificationPermissionStatus } from '../utils/notificationPermission';
import { getSnoozeReminderCopy } from '../utils/notificationCopy';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function dismissReminderFromTray(notificationId?: string): void {
  setImmediate(() => {
    const delayMs = Platform.OS === 'android' ? 300 : 50;
    setTimeout(() => {
      void (async () => {
        if (notificationId) {
          await Notifications.dismissNotificationAsync(notificationId).catch(() => {});
        }
        await Notifications.dismissAllNotificationsAsync().catch(() => {});
      })();
    }, delayMs);
  });
}

export function useNotificationsSetup() {
  const responseSubRef = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (isExpoGo) {
          console.log('Running in Expo Go - Push notifications (remote) are restricted.');
        }

        if (Platform.OS === 'android' && !isExpoGo) {
          try {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          } catch (channelError) {
            console.warn('Notification channel error:', channelError);
          }
        }

        const status = await getNotificationPermissionStatus();
        if (cancelled) return;

        console.log('Notification permission status:', status);

        if (status === 'granted') {
          const s = getSettings();
          const daySchedules: DaySchedule[] = s.day_schedules
            ? JSON.parse(s.day_schedules)
            : DEFAULT_SCHEDULES;

          await scheduleNotifications(
            s.notification_hour,
            s.notification_minute,
            (s.notif_mode as 'daily' | 'custom') || 'daily',
            daySchedules,
            s.notifications_enabled === 1,
            { sound: s.notification_sound_enabled !== 0 },
          );

          console.log('Notifications scheduled successfully');
        }

        if (cancelled) return;

        responseSubRef.current?.remove();
        responseSubRef.current = Notifications.addNotificationResponseReceivedListener(response => {
          const { actionIdentifier } = response;
          const notificationId = response.notification.request.identifier;

          if (actionIdentifier === 'finish-daf') {
            dismissReminderFromTray(notificationId);
            const { markTodayAsLearned } = useAppStore.getState();
            markTodayAsLearned();
          } else if (actionIdentifier === 'later') {
            dismissReminderFromTray(notificationId);
            const settings = getSettings();
            const snoozeCopy = getSnoozeReminderCopy(new Date());
            void Notifications.scheduleNotificationAsync({
              identifier: 'later-reminder',
              content: {
                title: snoozeCopy.title,
                body: snoozeCopy.body,
                sound: settings.notification_sound_enabled !== 0,
                categoryIdentifier: 'study-reminder',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 3600,
                repeats: false,
              },
            });
          }
        });
      } catch (e) {
        console.warn('Notification setup error:', e);
      }
    })();

    return () => {
      cancelled = true;
      responseSubRef.current?.remove();
      responseSubRef.current = undefined;
    };
  }, []);
}
