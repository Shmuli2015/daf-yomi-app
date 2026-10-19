import * as Notifications from 'expo-notifications';
import { getSettings } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { dismissReminderFromTray } from './dismissReminderFromTray';
import { requestHomeTabFocus } from './homeTabFocus';
import { queuePendingDafOpen } from './pendingDafOpen';
import { scheduleSnoozeReminder } from './scheduleSnoozeReminder';
import {
  getStudyReminderDateStr,
  getStudyReminderScheduledFor,
  getStudyReminderTargetFromResponse,
} from './studyReminderTarget';
import { getDafByDate, getDateStr } from './dafYomi';
import { getDafDayDate } from './dafDayBoundary';
import { captureException } from '../services/sentry';

export async function handleStudyReminderResponse(params: {
  actionIdentifier: string;
  notificationId?: string;
  response?: unknown;
}): Promise<void> {
  const { actionIdentifier, notificationId, response } = params;

  if (actionIdentifier === 'finish-daf') {
    try {
      const { setDafStudyStatus, markTodayAsLearned, loadInitialData } = useAppStore.getState();
      loadInitialData();

      const target = getStudyReminderTargetFromResponse(response);
      let targetDateStr = getStudyReminderDateStr(response) || target?.dateStr;
      if (!targetDateStr) {
        const scheduledFor = getStudyReminderScheduledFor(response);
        if (scheduledFor) {
          targetDateStr = getDateStr(getDafDayDate(new Date(scheduledFor), getSettings()));
        }
      }

      if (target && targetDateStr) {
        const [year, month, day] = targetDateStr.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day, 12, 0, 0);
        const dafInfo = getDafByDate(targetDate);
        setDafStudyStatus(targetDateStr, dafInfo.masechet, dafInfo.daf, 'learned');
      } else {
        markTodayAsLearned();
      }
    } catch (error) {
      captureException(error);
    }
    await dismissReminderFromTray(notificationId);
    return;
  }

  if (actionIdentifier === 'later') {
    const settings = getSettings();
    const snoozePromise = scheduleSnoozeReminder(settings.notification_sound_enabled !== 0).catch(captureException);
    const dismissPromise = dismissReminderFromTray(notificationId);
    await Promise.all([snoozePromise, dismissPromise]);
    return;
  }

  if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    const dismissPromise = dismissReminderFromTray(notificationId);
    const { loadInitialData } = useAppStore.getState();
    loadInitialData();

    const opensDaf = getSettings().notification_opens_daf === 1;
    const target = opensDaf ? getStudyReminderTargetFromResponse(response) : null;
    if (target) {
      queuePendingDafOpen(target, notificationId);
      await dismissPromise;
      return;
    }
    requestHomeTabFocus();
    await dismissPromise;
  }
}
