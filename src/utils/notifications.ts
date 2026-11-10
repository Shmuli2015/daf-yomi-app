import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSettings } from '../db/database';
import { getDafDayDate } from './dafDayBoundary';
import { hasExactAlarmPermission, promptForExactAlarmPermission } from './exactAlarm';
import { getStudyReminderCopy } from './notificationCopy';
import {
  DEFAULT_SCHEDULES,
  type DaySchedule,
  scheduleReminderWindow,
} from './reminderSchedule';
import { withReminderScheduleLock } from './reminderScheduleLock';
import { isSnoozeReminderId } from './snoozeConstants';
import { buildStudyReminderTarget } from './studyReminderTarget';
import { captureException } from '../services/sentry';

export { DEFAULT_SCHEDULES, type DaySchedule };

export type ScheduleNotificationsOptions = {
  promptForExactAlarm?: boolean;
  sound?: boolean;
};

async function cancelScheduledStudyReminders(preserveSnooze: boolean): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(item =>
    preserveSnooze ? !isSnoozeReminderId(item.identifier) : true,
  );
  await Promise.all(
    toCancel.map(item =>
      Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {}),
    ),
  );
}

async function scheduleNotificationsUnlocked(
  globalHour: number,
  globalMin: number,
  mode: 'daily' | 'custom',
  schedules: DaySchedule[],
  enabled: boolean,
  options?: ScheduleNotificationsOptions,
): Promise<number> {
  if (options?.promptForExactAlarm) {
    await promptForExactAlarmPermission();
  }

  const settings = getSettings();

  if (!enabled) {
    await cancelScheduledStudyReminders(false);
    return 0;
  }

  const hasExactAlarm = await hasExactAlarmPermission();
  if (!hasExactAlarm && __DEV__) {
    console.log(
      'Exact alarm permission not granted - reminders will be scheduled with approximate timing',
    );
  }

  await cancelScheduledStudyReminders(true);

  const sound = options?.sound !== false;
  const config = { mode, hour: globalHour, minute: globalMin, schedules };
  return scheduleReminderWindow(new Date(), config, settings, sound);
}

export async function scheduleNotifications(
  globalHour: number,
  globalMin: number,
  mode: 'daily' | 'custom',
  schedules: DaySchedule[],
  enabled: boolean,
  options?: ScheduleNotificationsOptions,
): Promise<number> {
  try {
    return await withReminderScheduleLock(() =>
      scheduleNotificationsUnlocked(globalHour, globalMin, mode, schedules, enabled, options),
    );
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
        title: 'התראת בדיקה',
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
