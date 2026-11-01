import * as Notifications from 'expo-notifications';
import { getSettings } from '../db/database';
import {
  REMINDER_WINDOW_DAYS,
  getScheduledForFromContentData,
  reminderModeFromSettings,
  resolveReminderTime,
  scheduleReminderWindow,
  scheduleStudyReminderAt,
  schedulesForReminderSettings,
  type ReminderConfig,
} from './reminderSchedule';
import { withReminderScheduleLock } from './reminderScheduleLock';
import { isSnoozeReminderId } from './snoozeConstants';

const DAY_MS = 24 * 60 * 60 * 1000;

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
    inFlight = withReminderScheduleLock(() => runExtension(now)).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function runExtension(now: Date): Promise<number> {
  const settings = getSettings();
  if (settings.notifications_enabled !== 1) return 0;

  const reminderMode = reminderModeFromSettings(settings.notif_mode);
  const config: ReminderConfig = {
    mode: reminderMode,
    hour: settings.notification_hour,
    minute: settings.notification_minute,
    schedules: schedulesForReminderSettings(settings.day_schedules, reminderMode),
  };
  const sound = settings.notification_sound_enabled !== 0;

  const scheduledTimes = await getScheduledReminderTimes();
  const upcomingTimes = [...scheduledTimes].filter(time => time > now.getTime());
  if (upcomingTimes.length === 0) {
    return scheduleReminderWindow(now, config, settings, sound);
  }

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
