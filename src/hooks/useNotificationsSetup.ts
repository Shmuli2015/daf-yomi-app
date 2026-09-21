import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getSettings } from '../db/database';
import { scheduleNotifications, DEFAULT_SCHEDULES, DaySchedule } from '../utils/notifications';
import { getNotificationPermissionStatus } from '../utils/notificationPermission';
import { dismissStuckStudyReminders } from '../utils/dismissStuckStudyReminders';
import { handleStudyReminderResponse } from '../utils/handleStudyReminderResponse';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useNotificationsSetup() {
  const responseSubRef = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const onResponse = (response: Notifications.NotificationResponse) => {
      void handleStudyReminderResponse({
        actionIdentifier: response.actionIdentifier,
        notificationId: response.notification.request.identifier,
      });
    };

    responseSubRef.current?.remove();
    responseSubRef.current = Notifications.addNotificationResponseReceivedListener(onResponse);

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

        await dismissStuckStudyReminders();
      } catch (e) {
        console.warn('Notification setup error:', e);
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
