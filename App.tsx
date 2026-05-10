import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { I18nManager, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
import { initDB } from './src/db/database';
import { useAppStore } from './src/store/useAppStore';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Define notification categories for interactive buttons
Notifications.setNotificationCategoryAsync('study-reminder', [
  {
    identifier: 'finish-daf',
    buttonTitle: '✅ סיימתי את הדף!',
    options: { opensAppToForeground: true },
  },
  {
    identifier: 'later',
    buttonTitle: '⏰ הזכר לי מאוחר יותר',
    options: { opensAppToForeground: false },
  },
]);

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const MIN_SPLASH_MS = 1800;

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const loadInitialData = useAppStore(state => state.loadInitialData);
  const startTime = useRef(Date.now());

  useEffect(() => {
    async function setup() {
      try {
        initDB();
        loadInitialData();

        if (isExpoGo) {
          console.log('Running in Expo Go - Push notifications (remote) are restricted.');
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
        }

        // Listener for when a notification is clicked or an action is performed
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
          const { actionIdentifier } = response;
          
          if (actionIdentifier === 'finish-daf') {
            const { markTodayAsLearned } = useAppStore.getState();
            markTodayAsLearned();
            // Optional: Show a success message if the app opens
          } else if (actionIdentifier === 'later') {
            // Re-schedule for 1 hour later
            Notifications.scheduleNotificationAsync({
              content: {
                title: '⏰ תזכורת נוספת',
                body: 'ביקשת שנזכיר לך שוב ללמוד את הדף היומי... ✨',
                sound: true,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 3600,
                repeats: false
              },
            });
          }
        });

        return () => subscription.remove();
      } catch (e) {
        console.warn('Notification setup error:', e);
      } finally {
        const elapsed = Date.now() - startTime.current;
        const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
        setTimeout(() => setIsReady(true), remaining);
      }
    }
    setup();
  }, [loadInitialData]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      {showSplash && (
        <SplashScreen
          isReady={isReady}
          onFinish={() => setShowSplash(false)}
        />
      )}
    </SafeAreaProvider>
  );
}
