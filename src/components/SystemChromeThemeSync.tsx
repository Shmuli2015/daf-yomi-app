import React, { useLayoutEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { resolveThemeScheme, ThemeMode, useTheme } from '../theme';

type Props = { themeMode: ThemeMode };

export default function SystemChromeThemeSync({ themeMode }: Props) {
  const systemScheme = (useColorScheme() || 'dark') as 'light' | 'dark';
  const isDark = resolveThemeScheme(themeMode, systemScheme) === 'dark';
  const { colors } = useTheme();

  useLayoutEffect(() => {
    void (async () => {
      try {
        await SystemUI.setBackgroundColorAsync(colors.background);
        if (Platform.OS === 'android') {
          await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
        }
      } catch {}
    })();
  }, [colors.background, isDark]);

  return null;
}
