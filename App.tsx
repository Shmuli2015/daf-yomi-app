import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { I18nManager, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB, getSettings } from './src/db/database';
import { useAppStore } from './src/store/useAppStore';
import * as Notifications from 'expo-notifications';
import { scheduleNotifications, DEFAULT_SCHEDULES, DaySchedule } from './src/utils/notifications';
import { getDafByDate } from './src/utils/dafYomi';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import { ThemeProvider, ThemeMode, DARK_THEME, LIGHT_THEME, resolveThemeScheme } from './src/theme';
import { useColorScheme } from 'react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

void Notifications.setNotificationCategoryAsync('study-reminder', [
  {
    identifier: 'finish-daf',
    buttonTitle: '✅ סיימתי את הדף!',
    options: { opensAppToForeground: true },
  },
  {
    identifier: 'later',
    buttonTitle: '⏰ הזכר לי עוד שעה',
    options: { opensAppToForeground: false },
  },
]).catch(() => {});

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const MIN_SPLASH_MS = 1800;
const SPLASH_HARD_MAX_MS = 6000;

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const loadInitialData = useAppStore(state => state.loadInitialData);
  const themeMode = (useAppStore(state => state.settings?.theme_mode) || 'system') as ThemeMode;
  const systemScheme = (useColorScheme() || 'dark') as 'dark' | 'light';
  const responseSubRef = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    const startTime = Date.now();
    try {
      initDB();
      loadInitialData();
    } catch (e) {
      console.warn('DB init error:', e);
    }
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    const readyTimer = setTimeout(() => setIsReady(true), remaining);
    const maxTimer = setTimeout(() => setIsReady(true), SPLASH_HARD_MAX_MS);
    return () => {
      clearTimeout(readyTimer);
      clearTimeout(maxTimer);
    };
  }, [loadInitialData]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (isExpoGo) {
          console.log('Running in Expo Go - Push notifications (remote) are restricted.');
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (cancelled) return;

        console.log('Notification permission status:', status);

        if (status === 'granted') {
          const s = getSettings();
          const daySchedules: DaySchedule[] = s.day_schedules
            ? JSON.parse(s.day_schedules)
            : DEFAULT_SCHEDULES;

          await scheduleNotifications(
            s.notification_hour,
            s.notification_minute,
            (s.notif_mode as 'daily' | 'custom') || 'daily',
            daySchedules,
            s.notifications_enabled === 1
          );

          console.log('Notifications scheduled successfully');
        }

        if (cancelled) return;

        responseSubRef.current?.remove();
        responseSubRef.current = Notifications.addNotificationResponseReceivedListener(response => {
          const { actionIdentifier } = response;

          if (actionIdentifier === 'finish-daf') {
            const { markTodayAsLearned } = useAppStore.getState();
            markTodayAsLearned();
          } else if (actionIdentifier === 'later') {
            const dafInfo = getDafByDate(new Date());
            void Notifications.scheduleNotificationAsync({
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
            });
          }
        });
      } catch (e) {
        console.warn('Notification setup error:', e);
      }
    })();

    return () => {
      cancelled = true;
      responseSubRef.current?.remove();
      responseSubRef.current = undefined;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode}>
        <NavigationContainer
          theme={{
            dark: resolveThemeScheme(themeMode, systemScheme) === 'dark',
            colors: {
              ...(resolveThemeScheme(themeMode, systemScheme) === 'dark'
                ? {
                    primary: DARK_THEME.colors.accent,
                    background: DARK_THEME.colors.background,
                    card: DARK_THEME.colors.surface,
                    text: DARK_THEME.colors.textPrimary,
                    border: DARK_THEME.colors.border,
                    notification: DARK_THEME.colors.accent,
                  }
                : {
                    primary: LIGHT_THEME.colors.accent,
                    background: LIGHT_THEME.colors.background,
                    card: LIGHT_THEME.colors.surface,
                    text: LIGHT_THEME.colors.textPrimary,
                    border: LIGHT_THEME.colors.border,
                    notification: LIGHT_THEME.colors.accent,
                  }),
            },
            fonts: undefined as any,
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
      {showSplash && (
        <SplashScreen isReady={isReady} onFinish={() => setShowSplash(false)} />
      )}
    </SafeAreaProvider>
  );
}
