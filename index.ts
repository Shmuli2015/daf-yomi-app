import { registerRootComponent } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { initDB } from './src/db/database';
import { useAppStore } from './src/store/useAppStore';
import { getSnoozeReminderCopy } from './src/utils/notificationCopy';
import {
  dismissReminderFromTray,
  getNotificationIdFromActionData,
} from './src/utils/dismissReminderFromTray';

import App from './App';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background notification task error:', error);
    return;
  }
  if (data) {
    const { actionIdentifier } = data as { actionIdentifier?: string };
    const notificationId = getNotificationIdFromActionData(data);

    try {
      initDB();
    } catch (e) {
      console.warn('DB init error in background task:', e);
    }

    if (actionIdentifier === 'finish-daf') {
      const { markTodayAsLearned, loadInitialData } = useAppStore.getState();
      loadInitialData();
      markTodayAsLearned();
      await dismissReminderFromTray(notificationId);
    } else if (actionIdentifier === 'later') {
      await dismissReminderFromTray(notificationId);

      const snoozeCopy = getSnoozeReminderCopy(new Date());
      await Notifications.scheduleNotificationAsync({
        identifier: 'later-reminder',
        content: {
          title: snoozeCopy.title,
          body: snoozeCopy.body,
          sound: true,
          categoryIdentifier: 'study-reminder',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3600,
          repeats: false,
        },
      }).catch(() => {});
    }
  }
});

if (!isExpoGo) {
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});
}

registerRootComponent(App);
