import React, { useLayoutEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { resolveThemeScheme, ThemeMode, useTheme } from '../theme';

type Props = { themeMode: ThemeMode };

/**
 * Keeps OS chrome in sync with the app theme. On Android (edge-to-edge), the
 * navigation bar is transparent; the root window color must match or the
 * gesture / inset strip looks wrong. Button style keeps icons readable.
 */
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
      } catch {
        // Dev client / unsupported: ignore
      }
    })();
  }, [colors.background, isDark]);

  return null;
}
