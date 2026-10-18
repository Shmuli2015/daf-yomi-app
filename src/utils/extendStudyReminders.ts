import * as Notifications from 'expo-notifications';
import { getSettings } from '../db/database';
import {
  DEFAULT_SCHEDULES,
  REMINDER_WINDOW_DAYS,
  type DaySchedule,
  getScheduledForFromContentData,
  resolveReminderTime,
  scheduleStudyReminderAt,
  type ReminderConfig,
} from './reminderSchedule';
import { isSnoozeReminderId } from './snoozeConstants';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseSchedules(json: string | null | undefined): DaySchedule[] {
  if (!json) return DEFAULT_SCHEDULES;
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as DaySchedule[]) : DEFAULT_SCHEDULES;
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

async function getScheduledReminderTimes(): Promise<Set<number>> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const times = new Set<number>();
  for (const item of scheduled) {
    if (isSnoozeReminderId(item.identifier)) continue;
    const scheduledFor = getScheduledForFromContentData(item.content?.data);
    if (scheduledFor !== null) {
      times.add(scheduledFor);
    }
  }
  return times;
}

let inFlight: Promise<number> | null = null;

export function extendStudyReminders(now: Date = new Date()): Promise<number> {
  if (!inFlight) {
    inFlight = runExtension(now).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function runExtension(now: Date): Promise<number> {
  const settings = getSettings();
  if (settings.notifications_enabled !== 1) return 0;

  const scheduledTimes = await getScheduledReminderTimes();
  const upcomingTimes = [...scheduledTimes].filter(time => time > now.getTime());
  if (upcomingTimes.length === 0) return 0;

  const config: ReminderConfig = {
    mode: (settings.notif_mode as 'daily' | 'custom') || 'daily',
    hour: settings.notification_hour,
    minute: settings.notification_minute,
    schedules: parseSchedules(settings.day_schedules),
  };
  const sound = settings.notification_sound_enabled !== 0;
  const horizon = now.getTime() + REMINDER_WINDOW_DAYS * DAY_MS;

  const day = new Date(Math.max(...upcomingTimes));
  day.setHours(12, 0, 0, 0);
  let added = 0;

  for (;;) {
    day.setDate(day.getDate() + 1);
    const reminderTime = resolveReminderTime(day, config);
    if (reminderTime && reminderTime.getTime() > horizon) break;
    if (!reminderTime && day.getTime() > horizon) break;
    if (!reminderTime) continue;
    if (reminderTime.getTime() <= now.getTime() || scheduledTimes.has(reminderTime.getTime())) {
      continue;
    }
    await scheduleStudyReminderAt(reminderTime, settings, sound);
    scheduledTimes.add(reminderTime.getTime());
    added += 1;
  }

  return added;
}
