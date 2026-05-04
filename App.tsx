import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/db/database';
import { useAppStore } from './src/store/useAppStore';
import * as Notifications from 'expo-notifications';
import { View, Text } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

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

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const loadInitialData = useAppStore(state => state.loadInitialData);

  useEffect(() => {
    async function setup() {
      try {
        initDB();
        loadInitialData();
        
        // Only request permissions and setup notifications if not in Expo Go 
        // OR handle it gracefully as local notifications might still work.
        // In SDK 54, Expo Go warns/errors on push-related calls.
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
        setIsReady(true);
      }
    }
    setup();
  }, [loadInitialData]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>טוען נתונים...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
