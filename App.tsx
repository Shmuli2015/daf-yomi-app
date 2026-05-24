import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { I18nManager } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

import { useAppStore } from './src/store/useAppStore';
import * as Notifications from 'expo-notifications';
import { useNotificationsSetup } from './src/hooks/useNotificationsSetup';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import { ThemeProvider, ThemeMode, resolveThemeScheme, getNavigationThemeColors } from './src/theme';
import { useColorScheme } from 'react-native';
import SystemChromeThemeSync from './src/components/SystemChromeThemeSync';
import { AppUpdateProvider } from './src/context/AppUpdateProvider';

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
    options: { opensAppToForeground: false },
  },
  {
    identifier: 'later',
    buttonTitle: '⏰ הזכר לי עוד שעה',
    options: { opensAppToForeground: false },
  },
]).catch(() => {});



export default function App() {
  const { isReady, showSplash, onSplashFinish } = useAppInitialization();
  const themeMode = (useAppStore(state => state.settings?.theme_mode) || 'system') as ThemeMode;
  const systemScheme = (useColorScheme() || 'dark') as 'dark' | 'light';
  useNotificationsSetup();

  const isDark = resolveThemeScheme(themeMode, systemScheme) === 'dark';
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode}>
        <SystemChromeThemeSync themeMode={themeMode} />
        <AppUpdateProvider>
          <NavigationContainer
            theme={{
              ...navigationTheme,
              dark: isDark,
              colors: {
                ...navigationTheme.colors,
                ...getNavigationThemeColors(themeMode, systemScheme),
              },
            }}
          >
            <RootNavigator />
          </NavigationContainer>
          {showSplash && (
            <SplashScreen isReady={isReady} onFinish={onSplashFinish} />
          )}
        </AppUpdateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
