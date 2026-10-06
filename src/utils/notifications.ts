import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSettings } from '../db/database';
import { getDafDayDate } from './dafDayBoundary';
import { hasExactAlarmPermission, promptForExactAlarmPermission } from './exactAlarm';
import { getStudyReminderCopy } from './notificationCopy';
import { captureException } from '../services/sentry';

export type DaySchedule = { enabled: boolean; hour: number; minute: number };

export const DEFAULT_SCHEDULES: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 6,
  hour: 7,
  minute: 30,
}));

export type ScheduleNotificationsOptions = {
  promptForExactAlarm?: boolean;
  sound?: boolean;
};

export async function scheduleNotifications(
  globalHour: number,
  globalMin: number,
  mode: 'daily' | 'custom',
  schedules: DaySchedule[],
  enabled: boolean,
  options?: ScheduleNotificationsOptions,
) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;

    if (options?.promptForExactAlarm) {
      await promptForExactAlarmPermission();
    }
    const hasExactAlarm = await hasExactAlarmPermission();
    if (!hasExactAlarm && __DEV__) {
      console.log(
        'Exact alarm permission not granted - reminders will be scheduled with approximate timing',
      );
    }

    const isAndroid = Platform.OS === 'android';
    const today = new Date();
    const DAYS_TO_SCHEDULE = 30;
    const notificationPromises: Promise<string>[] = [];
    const sound = options?.sound !== false;
    const settings = getSettings();

    if (mode === 'daily') {
      for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        targetDate.setHours(globalHour, globalMin, 0, 0);

        if (targetDate.getTime() <= Date.now()) {
          continue;
        }

        const copy = getStudyReminderCopy(getDafDayDate(targetDate, settings));
        
        const content: Notifications.NotificationContentInput = {
          title: copy.title,
          body: copy.body,
          sound,
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
          continue;
        }
        
        const copy = getStudyReminderCopy(getDafDayDate(targetDate, settings));
        
        const content: Notifications.NotificationContentInput = {
          title: copy.title,
          body: copy.body,
          sound,
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

    await Promise.all(notificationPromises);
  } catch (error) {
    captureException(error);
    throw error;
  }
}

export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    captureException(error);
    return [];
  }
}

export async function sendTestNotification(sound = true) {
  try {
    await promptForExactAlarmPermission({ force: true });

    const copy = getStudyReminderCopy(getDafDayDate(new Date(), getSettings()));
    const isAndroid = Platform.OS === 'android';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 התראת בדיקה',
        body: copy.body,
        sound,
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
  } catch (error) {
    captureException(error);
    throw error;
  }
}
