import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getSettings } from '../db/database';
import { scheduleNotifications, DEFAULT_SCHEDULES, DaySchedule } from '../utils/notifications';
import { useAppStore } from '../store/useAppStore';
import { getDafByDate } from '../utils/dafYomi';

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

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const { status } = await Notifications.requestPermissionsAsync();
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
            s.notifications_enabled === 1
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
            const dafInfo = getDafByDate(new Date());
            void Notifications.scheduleNotificationAsync({
              identifier: 'later-reminder',
              content: {
                title: '⏰ תזכורת נוספת',
                body: `${dafInfo.masechet} ${dafInfo.daf} - ביקשת שנזכיר לך שוב... ✨`,
                sound: true,
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
