import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { I18nManager } from 'react-native';
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
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
