import * as Notifications from 'expo-notifications';
import { getSettings } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { dismissReminderFromTray } from './dismissReminderFromTray';
import { requestHomeTabFocus } from './homeTabFocus';
import { scheduleSnoozeReminder } from './scheduleSnoozeReminder';

export async function handleStudyReminderResponse(params: {
  actionIdentifier: string;
  notificationId?: string;
}): Promise<void> {
  const { actionIdentifier, notificationId } = params;

  if (actionIdentifier === 'finish-daf') {
    await dismissReminderFromTray(notificationId);
    const { markTodayAsLearned, loadInitialData } = useAppStore.getState();
    loadInitialData();
    markTodayAsLearned();
    return;
  }

  if (actionIdentifier === 'later') {
    await dismissReminderFromTray(notificationId);
    const settings = getSettings();
    await scheduleSnoozeReminder(settings.notification_sound_enabled !== 0).catch(() => {});
    return;
  }

  if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    const { loadInitialData } = useAppStore.getState();
    loadInitialData();
    requestHomeTabFocus();
  }
}
