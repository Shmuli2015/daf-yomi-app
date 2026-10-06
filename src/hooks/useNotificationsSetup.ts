import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getSettings } from '../db/database';
import { scheduleNotifications, DEFAULT_SCHEDULES, DaySchedule } from '../utils/notifications';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from '../utils/notificationPermission';
import { dismissStuckStudyReminders } from '../utils/dismissStuckStudyReminders';
import { getNotificationIdFromActionData } from '../utils/dismissReminderFromTray';
import { handleStudyReminderResponse } from '../utils/handleStudyReminderResponse';
import { captureException } from '../services/sentry';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useNotificationsSetup() {
  const responseSubRef = useRef<EventSubscription | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const onResponse = (response: Notifications.NotificationResponse) => {
      void handleStudyReminderResponse({
        actionIdentifier: response.actionIdentifier,
        notificationId: getNotificationIdFromActionData(response) || response.notification?.request?.identifier,
      });
    };

    responseSubRef.current?.remove();
    responseSubRef.current = Notifications.addNotificationResponseReceivedListener(onResponse);

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
    };
  }, []);
}
