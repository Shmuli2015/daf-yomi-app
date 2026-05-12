import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import { getDafByDate } from './dafYomi';

export type DaySchedule = { enabled: boolean; hour: number; minute: number };

export const DEFAULT_SCHEDULES: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 6,
  hour: 7,
  minute: 30,
}));

async function checkAndRequestExactAlarmPermission(): Promise<boolean> {
  return true;
}

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

    const hasPermission = await checkAndRequestExactAlarmPermission();
    if (!hasPermission) {
      console.log('Exact alarm permission not granted');
      return;
    }

    const isAndroid = Platform.OS === 'android';
    const today = new Date();
    const DAYS_TO_SCHEDULE = 30;
    const notificationPromises: Promise<string>[] = [];

    if (mode === 'daily') {
      for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        targetDate.setHours(globalHour, globalMin, 0, 0);

        if (targetDate.getTime() <= Date.now()) {
          console.log(`Skipping past notification for ${targetDate.toISOString()}`);
          continue;
        }

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
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: targetDate,
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: targetDate,
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
        
        if (targetDate.getTime() <= Date.now()) {
          console.log(`Skipping past notification for ${targetDate.toISOString()}`);
          continue;
        }
        
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
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: targetDate,
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: targetDate,
              },
        });
        
        notificationPromises.push(promise);
      }
    }

    const results = await Promise.all(notificationPromises);
    console.log(`Successfully scheduled ${results.length} notifications`);
    
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Total scheduled notifications in system: ${scheduled.length}`);
    if (scheduled.length > 0) {
      console.log('First scheduled notification:', JSON.stringify(scheduled[0], null, 2));
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error instanceof Error ? error.message : error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
  }
}

export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${notifications.length} scheduled notifications`);
    return notifications;
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

export async function sendTestNotification() {
  try {
    const hasPermission = await checkAndRequestExactAlarmPermission();
    if (!hasPermission) {
      console.log('Cannot send test notification - exact alarm permission not granted');
      return;
    }

    const dafInfo = getDafByDate(new Date());
    const isAndroid = Platform.OS === 'android';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 התראת בדיקה',
        body: `הדף היומי: ${dafInfo.masechet} ${dafInfo.daf}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'study-reminder',
      },
      trigger: isAndroid
        ? {
            channelId: 'default',
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            repeats: false,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            repeats: false,
          },
    });
    
    console.log('Test notification scheduled for 5 seconds from now');
  } catch (error) {
    console.error('Failed to send test notification:', error);
  }
}
