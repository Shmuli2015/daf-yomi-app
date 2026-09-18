import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getSnoozeReminderCopy } from './notificationCopy';

const SNOOZE_SECONDS = 3600;

export async function scheduleSnoozeReminder(soundEnabled: boolean): Promise<void> {
  const snoozeCopy = getSnoozeReminderCopy(new Date());
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
    identifier: 'later-reminder',
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
