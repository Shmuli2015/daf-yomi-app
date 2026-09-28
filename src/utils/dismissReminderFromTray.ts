import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const STUDY_REMINDER_CATEGORY = 'study-reminder';
const ANDROID_RETRY_DELAYS_MS = [0, 150, 450];
const IOS_RETRY_DELAYS_MS = [0, 50];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getNotificationIdFromActionData(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const value = data as {
    notification?: { request?: { identifier?: unknown }; identifier?: unknown };
    notificationResponse?: {
      notification?: { request?: { identifier?: unknown }; identifier?: unknown };
      identifier?: unknown;
    };
    request?: { identifier?: unknown };
    identifier?: unknown;
  };

  const candidates = [
    value.notification?.request?.identifier,
    value.notification?.identifier,
    value.notificationResponse?.notification?.request?.identifier,
    value.notificationResponse?.notification?.identifier,
    value.request?.identifier,
    value.identifier,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }

  return undefined;
}

function isStudyReminder(notification: Notifications.Notification): boolean {
  const category = notification.request?.content?.categoryIdentifier;
  return category === STUDY_REMINDER_CATEGORY || !category;
}

async function getPresentedNotifications(): Promise<Notifications.Notification[]> {
  try {
    return await Notifications.getPresentedNotificationsAsync();
  } catch {
    return [];
  }
}

function reminderStillInTray(
  presented: Notifications.Notification[],
  notificationId?: string,
): boolean {
  if (presented.length === 0) {
    return false;
  }
  if (notificationId && presented.some(item => item.request?.identifier === notificationId)) {
    return true;
  }
  return presented.some(isStudyReminder);
}

async function dismissPresentedReminders(notificationId?: string): Promise<void> {
  if (notificationId) {
    await Notifications.dismissNotificationAsync(notificationId).catch(() => {});
  }

  const presented = await getPresentedNotifications();
  const ids = new Set<string>();
  if (notificationId) {
    ids.add(notificationId);
  }
  for (const item of presented) {
    if (item.request?.identifier) {
      ids.add(item.request.identifier);
    }
  }

  await Promise.all(
    [...ids].map(id => Notifications.dismissNotificationAsync(id).catch(() => {})),
  );

  await Notifications.dismissAllNotificationsAsync().catch(() => {});
}

export async function dismissReminderFromTray(notificationId?: string): Promise<void> {
  const delaysMs = Platform.OS === 'android' ? ANDROID_RETRY_DELAYS_MS : IOS_RETRY_DELAYS_MS;

  for (const delayMs of delaysMs) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    await dismissPresentedReminders(notificationId);

    const presented = await getPresentedNotifications();
    if (!reminderStillInTray(presented, notificationId)) {
      return;
    }
  }

  await Notifications.dismissAllNotificationsAsync().catch(() => {});
}
