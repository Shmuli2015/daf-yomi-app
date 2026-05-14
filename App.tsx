import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Appearance, AppState, I18nManager, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

import { useAppStore } from './src/store/useAppStore';
import * as Notifications from 'expo-notifications';
import { useNotificationsSetup } from './src/hooks/useNotificationsSetup';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import { ThemeProvider, ThemeMode, resolveThemeScheme, getNavigationThemeColors } from './src/theme';
import { useColorScheme } from 'react-native';
import SystemChromeThemeSync from './src/components/SystemChromeThemeSync';
import { syncWidgetData } from './src/widgets/shared/widgetDataSync';

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

  useEffect(() => {
    if (Platform.OS !== 'android' || themeMode !== 'system') return;
    const sub = Appearance.addChangeListener(() => {
      syncWidgetData().catch(() => {});
    });
    return () => sub.remove();
  }, [themeMode]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') syncWidgetData().catch(() => {});
    });
    return () => sub.remove();
  }, []);



  return (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode}>
        <SystemChromeThemeSync themeMode={themeMode} />
        <NavigationContainer
          theme={{
            dark: resolveThemeScheme(themeMode, systemScheme) === 'dark',
            colors: getNavigationThemeColors(themeMode, systemScheme),
            fonts: undefined as any,
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
      {showSplash && (
        <SplashScreen 
          isReady={isReady} 
          onFinish={onSplashFinish} 
        />
      )}
    </SafeAreaProvider>
  );
}
