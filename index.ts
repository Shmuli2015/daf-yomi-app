import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { getDafByDate } from './src/utils/dafYomi';
import { initDB } from './src/db/database';
import { useAppStore } from './src/store/useAppStore';
import { widgetTaskHandler } from './src/widgets/android/widgetTaskHandler';
import { syncWidgetData } from './src/widgets/shared/widgetDataSync';

import App from './App';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  if (error) {
    console.error('Background notification task error:', error);
    return;
  }
  if (data) {
    const { actionIdentifier, notification } = data as any;
    const notificationId = notification?.request?.identifier;

    try {
      initDB();
    } catch (e) {
      console.warn('DB init error in background task:', e);
    }

    if (actionIdentifier === 'finish-daf') {
      if (notificationId) {
        Notifications.dismissNotificationAsync(notificationId).catch(() => {});
      }
      
      const { markTodayAsLearned, loadInitialData } = useAppStore.getState();
      loadInitialData();
      markTodayAsLearned();
      syncWidgetData().catch(() => {});
      
    } else if (actionIdentifier === 'later') {
      if (notificationId) {
        Notifications.dismissNotificationAsync(notificationId).catch(() => {});
      }
      
      const dafInfo = getDafByDate(new Date());
      Notifications.scheduleNotificationAsync({
        identifier: 'later-reminder',
        content: {
          title: '⏰ תזכורת נוספת',
          body: `${dafInfo.masechet} ${dafInfo.daf} - ביקשת שנזכיר לך שוב... ✨`,
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

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});

registerWidgetTaskHandler(widgetTaskHandler);

registerRootComponent(App);
