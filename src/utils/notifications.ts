import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSettings } from '../db/database';
import { getDafDayDate } from './dafDayBoundary';
import { hasExactAlarmPermission, promptForExactAlarmPermission } from './exactAlarm';
import { getStudyReminderCopy } from './notificationCopy';
import {
  DEFAULT_SCHEDULES,
  REMINDER_WINDOW_DAYS,
  type DaySchedule,
  resolveReminderTime,
  scheduleStudyReminderAt,
} from './reminderSchedule';
import { buildStudyReminderTarget } from './studyReminderTarget';
import { captureException } from '../services/sentry';

export { DEFAULT_SCHEDULES, type DaySchedule };

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

    const today = new Date();
    const sound = options?.sound !== false;
    const settings = getSettings();
    const config = { mode, hour: globalHour, minute: globalMin, schedules };
    const notificationPromises: Promise<string>[] = [];

    for (let dayOffset = 0; dayOffset < REMINDER_WINDOW_DAYS; dayOffset++) {
      const day = new Date(today);
      day.setDate(today.getDate() + dayOffset);
      const reminderTime = resolveReminderTime(day, config);
      if (!reminderTime || reminderTime.getTime() <= Date.now()) {
        continue;
      }
      notificationPromises.push(scheduleStudyReminderAt(reminderTime, settings, sound));
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

    const dafDate = getDafDayDate(new Date(), getSettings());
    const copy = getStudyReminderCopy(dafDate);
    const isAndroid = Platform.OS === 'android';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 התראת בדיקה',
        body: copy.body,
        sound,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'study-reminder',
        data: buildStudyReminderTarget(dafDate),
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
