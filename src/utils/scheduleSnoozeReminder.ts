import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getSettings } from '../db/database';
import { getDafDayDate } from './dafDayBoundary';
import { getSnoozeReminderCopy } from './notificationCopy';

import { SNOOZE_REMINDER_PREFIX, isSnoozeReminderId } from './snoozeConstants';

const SNOOZE_SECONDS = 3600;
export { SNOOZE_REMINDER_PREFIX, isSnoozeReminderId };

export async function cancelExistingSnoozeReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const snoozeItems = scheduled.filter(item => isSnoozeReminderId(item.identifier));
    await Promise.all(
      snoozeItems.map(item =>
        Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {}),
      ),
    );
  } catch {}
}

export async function scheduleSnoozeReminder(soundEnabled: boolean): Promise<void> {
  await cancelExistingSnoozeReminders();

  const snoozeCopy = getSnoozeReminderCopy(getDafDayDate(new Date(), getSettings()));
  const isAndroid = Platform.OS === 'android';

  const trigger: Notifications.NotificationTriggerInput = isAndroid
    ? {
        channelId: 'default',
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: SNOOZE_SECONDS,
        repeats: false,
      }
    : {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: SNOOZE_SECONDS,
        repeats: false,
      };

  await Notifications.scheduleNotificationAsync({
    identifier: `${SNOOZE_REMINDER_PREFIX}-${Date.now()}`,
    content: {
      title: snoozeCopy.title,
      body: snoozeCopy.body,
      sound: soundEnabled,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'study-reminder',
    },
    trigger,
  });
}
