import React, { useEffect, useLayoutEffect } from 'react';
import { AppState, Platform, useColorScheme } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { resolveThemeScheme, ThemeMode, useTheme } from '../theme';
import { captureException } from '../services/sentry';

type Props = { themeMode: ThemeMode };

type NavigationBarStyle = 'light' | 'dark';

type AndroidNavigationBarModule = {
  setStyle: (style: NavigationBarStyle) => Promise<void>;
};

const ACTIVITY_UNAVAILABLE_CODES = new Set([
  'ERR_MISSING_ACTIVITY',
  'ERR_APP_CONTEXT_LOST',
  'ERR_REACT_CONTEXT_LOST',
]);

const androidNavigationBar =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<AndroidNavigationBarModule>('ExpoNavigationBar')
    : null;

function isActivityUnavailable(error: unknown, seen = new Set<unknown>()): boolean {
  if (!error || typeof error !== 'object' || seen.has(error)) return false;
  seen.add(error);
  const current = error as { code?: unknown; message?: unknown; cause?: unknown };
  if (typeof current.code === 'string' && ACTIVITY_UNAVAILABLE_CODES.has(current.code)) {
    return true;
  }
  if (typeof current.message === 'string') {
    const message = current.message.toLowerCase();
    if (message.includes('no longer available') || message.includes('has been lost')) {
      return true;
    }
  }
  return isActivityUnavailable(current.cause);
}

async function applyAndroidNavigationBarStyle(style: NavigationBarStyle): Promise<void> {
  if (!androidNavigationBar || AppState.currentState !== 'active') return;
  try {
    await androidNavigationBar.setStyle(style);
  } catch (error) {
    if (isActivityUnavailable(error)) return;
    captureException(error);
  }
}

export default function SystemChromeThemeSync({ themeMode }: Props) {
  const systemScheme = (useColorScheme() || 'dark') as 'light' | 'dark';
  const isDark = resolveThemeScheme(themeMode, systemScheme) === 'dark';
  const { colors } = useTheme();
  const navigationBarStyle: NavigationBarStyle = isDark ? 'dark' : 'light';

  useLayoutEffect(() => {
    void (async () => {
      try {
        await SystemUI.setBackgroundColorAsync(colors.background);
      } catch {}
    })();
  }, [colors.background]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    void applyAndroidNavigationBarStyle(navigationBarStyle);
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void applyAndroidNavigationBarStyle(navigationBarStyle);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigationBarStyle]);

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}
