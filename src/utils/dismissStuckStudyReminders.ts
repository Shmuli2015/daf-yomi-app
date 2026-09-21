import * as Notifications from 'expo-notifications';
import { getDailyRecord } from '../db/database';
import { getDateStr } from './dafYomi';
import { dismissReminderFromTray } from './dismissReminderFromTray';

const SNOOZE_REMINDER_ID = 'later-reminder';

export async function dismissStuckStudyReminders(): Promise<void> {
  try {
    const record = getDailyRecord(getDateStr(new Date()));
    if (record?.status === 'learned') {
      await dismissReminderFromTray();
      return;
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hasSnoozePending = scheduled.some(item => item.identifier === SNOOZE_REMINDER_ID);
    if (hasSnoozePending) {
      await dismissReminderFromTray();
    }
  } catch (e) {
    console.warn('Dismiss stuck reminders error:', e);
  }
}
