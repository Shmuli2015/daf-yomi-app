import React, { useLayoutEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { NavigationBar } from 'expo-navigation-bar';
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
      } catch {}
    })();
  }, [colors.background]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationBar style={isDark ? 'dark' : 'light'} />
    </>
  );
}
