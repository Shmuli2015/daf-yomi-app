import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDafDayDate, type DafDayBoundarySettings } from './dafDayBoundary';
import { getStudyReminderCopy } from './notificationCopy';
import { buildStudyReminderTarget } from './studyReminderTarget';

export const REMINDER_WINDOW_DAYS = 30;

export type DaySchedule = { enabled: boolean; hour: number; minute: number };

export const DEFAULT_SCHEDULES: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 6,
  hour: 7,
  minute: 30,
}));

export type ReminderConfig = {
  mode: 'daily' | 'custom';
  hour: number;
  minute: number;
  schedules: DaySchedule[];
};

export function resolveReminderTime(day: Date, config: ReminderConfig): Date | null {
  const target = new Date(day);
  if (config.mode === 'daily') {
    target.setHours(config.hour, config.minute, 0, 0);
    return target;
  }
  const dayOfWeek = day.getDay();
  const schedule = config.schedules[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
  if (!schedule || !schedule.enabled) return null;
  target.setHours(schedule.hour, schedule.minute, 0, 0);
  return target;
}

export function getScheduledForFromContentData(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const value = (data as { scheduledFor?: unknown }).scheduledFor;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function scheduleStudyReminderAt(
  reminderTime: Date,
  dafDaySettings: DafDayBoundarySettings,
  sound: boolean,
): Promise<string> {
  const dafDate = getDafDayDate(reminderTime, dafDaySettings);
  const copy = getStudyReminderCopy(dafDate);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: copy.title,
      body: copy.body,
      sound,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'study-reminder',
      data: {
        ...buildStudyReminderTarget(dafDate),
        scheduledFor: reminderTime.getTime(),
      },
    },
    trigger:
      Platform.OS === 'android'
        ? {
            channelId: 'default',
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderTime,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderTime,
          },
  });
}
