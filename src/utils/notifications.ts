import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type DaySchedule = { enabled: boolean; hour: number; minute: number };

export const DEFAULT_SCHEDULES: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 6,
  hour: 7,
  minute: 30,
}));

export async function scheduleNotifications(
  globalHour: number,
  globalMin: number,
  mode: 'daily' | 'custom',
  schedules: DaySchedule[],
  enabled: boolean
) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;

    const content: Notifications.NotificationContentInput = {
      title: '📖 זמן הלימוד היומי הגיע',
      body: 'הדף היומי מחכה לך. הגיע הזמן לצלול לתוך הים של התלמוד... 🕯️',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    };

    const isAndroid = Platform.OS === 'android';

    if (mode === 'daily') {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: isAndroid
          ? {
              channelId: 'default',
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: globalHour,
              minute: globalMin,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour: globalHour,
              minute: globalMin,
              second: 0,
              repeats: true,
            },
      });
    } else {
      for (let i = 0; i < schedules.length; i++) {
        const s = schedules[i];
        if (!s.enabled) continue;
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: isAndroid
            ? {
                channelId: 'default',
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: i + 1,
                hour: s.hour,
                minute: s.minute,
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                weekday: i + 1,
                hour: s.hour,
                minute: s.minute,
                second: 0,
                repeats: true,
              },
        });
      }
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error instanceof Error ? error.message : error);
  }
}
