import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDafByDate } from './dafYomi';

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

    const isAndroid = Platform.OS === 'android';
    const today = new Date();
    const DAYS_TO_SCHEDULE = 30;
    const notificationPromises: Promise<string>[] = [];

    if (mode === 'daily') {
      for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        targetDate.setHours(globalHour, globalMin, 0, 0);

        const dafInfo = getDafByDate(targetDate);
        
        const content: Notifications.NotificationContentInput = {
          title: '📖 זמן הלימוד היומי הגיע',
          body: `הדף היומי מחכה לך: ${dafInfo.masechet} ${dafInfo.daf}. הגיע הזמן לצלול לתוך הים של התלמוד... 🕯️`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'study-reminder',
        };

        const promise = Notifications.scheduleNotificationAsync({
          content,
          trigger: isAndroid
            ? {
                channelId: 'default',
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: targetDate.getFullYear(),
                month: targetDate.getMonth() + 1,
                day: targetDate.getDate(),
                hour: globalHour,
                minute: globalMin,
                second: 0,
                repeats: false,
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: targetDate.getFullYear(),
                month: targetDate.getMonth() + 1,
                day: targetDate.getDate(),
                hour: globalHour,
                minute: globalMin,
                second: 0,
                repeats: false,
              },
        });
        
        notificationPromises.push(promise);
      }
    } else {
      for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        
        const dayOfWeek = targetDate.getDay();
        const scheduleIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const daySchedule = schedules[scheduleIndex];
        
        if (!daySchedule || !daySchedule.enabled) continue;

        targetDate.setHours(daySchedule.hour, daySchedule.minute, 0, 0);
        const dafInfo = getDafByDate(targetDate);
        
        const content: Notifications.NotificationContentInput = {
          title: '📖 זמן הלימוד היומי הגיע',
          body: `הדף היומי מחכה לך: ${dafInfo.masechet} ${dafInfo.daf}. הגיע הזמן לצלול לתוך הים של התלמוד... 🕯️`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'study-reminder',
        };

        const promise = Notifications.scheduleNotificationAsync({
          content,
          trigger: isAndroid
            ? {
                channelId: 'default',
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: targetDate.getFullYear(),
                month: targetDate.getMonth() + 1,
                day: targetDate.getDate(),
                hour: daySchedule.hour,
                minute: daySchedule.minute,
                second: 0,
                repeats: false,
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                year: targetDate.getFullYear(),
                month: targetDate.getMonth() + 1,
                day: targetDate.getDate(),
                hour: daySchedule.hour,
                minute: daySchedule.minute,
                second: 0,
                repeats: false,
              },
        });
        
        notificationPromises.push(promise);
      }
    }

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Failed to schedule notification:', error instanceof Error ? error.message : error);
  }
}
