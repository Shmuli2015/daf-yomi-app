import * as Notifications from 'expo-notifications';
import { getSettings } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { dismissReminderFromTray } from './dismissReminderFromTray';
import { requestHomeTabFocus } from './homeTabFocus';
import { queuePendingDafOpen } from './pendingDafOpen';
import { scheduleSnoozeReminder } from './scheduleSnoozeReminder';
import { getStudyReminderTargetFromResponse } from './studyReminderTarget';

export async function handleStudyReminderResponse(params: {
  actionIdentifier: string;
  notificationId?: string;
  response?: unknown;
}): Promise<void> {
  const { actionIdentifier, notificationId, response } = params;

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
    await dismissReminderFromTray(notificationId);
    const { loadInitialData } = useAppStore.getState();
    loadInitialData();

    const opensDaf = getSettings().notification_opens_daf === 1;
    const target = opensDaf ? getStudyReminderTargetFromResponse(response) : null;
    if (target) {
      queuePendingDafOpen(target, notificationId);
      return;
    }
    requestHomeTabFocus();
  }
}
