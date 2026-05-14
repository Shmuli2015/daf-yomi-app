import React, { useLayoutEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import {
  StatusBar,
  setStatusBarBackgroundColor,
  setStatusBarTranslucent,
} from 'expo-status-bar';
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
          await NavigationBar.setBackgroundColorAsync(colors.tabBar);
          await NavigationBar.setBorderColorAsync(colors.border);
          NavigationBar.setStyle(isDark ? 'dark' : 'light');
          setStatusBarTranslucent(true);
          setStatusBarBackgroundColor('transparent');
        }
      } catch {}
    })();
  }, [colors.background, colors.tabBar, colors.border, isDark]);

  return (
    <StatusBar
      style={isDark ? 'light' : 'dark'}
      translucent
      backgroundColor="transparent"
    />
  );
}
