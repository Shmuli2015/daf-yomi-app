import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeScheme = 'light' | 'dark';

export type Theme = {
  colors: {
    background: string;
    surface: string;
    primary: string;
    accent: string;
    accentLight: string;
    accentBorder: string;
    success: string;
    successLight: string;
    danger: string;
    dangerLight: string;
    muted: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    progressTrack: string;
    tabBar: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
  shadow: {
    card: any;
    cardMedium: any;
    hero: any;
    gold: any;
    tabBar: any;
  };
};

export const DARK_THEME: Theme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#E0E0E0',
    accent: '#C9963C',
    accentLight: 'rgba(201,150,60,0.1)',
    accentBorder: 'rgba(201,150,60,0.25)',
    success: '#10B981',
    successLight: 'rgba(16,185,129,0.15)',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    muted: '#6B7280',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#52525B',
    border: '#27272A',
    progressTrack: '#3F3F46',
    tabBar: '#18181B',
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    full: 9999,
  },
  shadow: {
    card: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    cardMedium: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 5,
    },
    hero: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 10,
    },
    gold: {
      shadowColor: '#C9963C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    tabBar: {
      shadowColor: '#C9963C',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const LIGHT_THEME: Theme = {
  ...DARK_THEME,
  colors: {
    ...DARK_THEME.colors,
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    border: '#E2E8F0',
    progressTrack: '#CBD5E1',
    tabBar: '#FFFFFF',
    accentLight: 'rgba(201,150,60,0.14)',
  },
};

export function resolveThemeScheme(mode: ThemeMode, systemScheme: ThemeScheme): ThemeScheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return systemScheme;
}

export function getNavigationThemeColors(mode: ThemeMode, systemScheme: ThemeScheme) {
  const isDark = resolveThemeScheme(mode, systemScheme) === 'dark';
  const themeColors = isDark ? DARK_THEME.colors : LIGHT_THEME.colors;
  
  return {
    primary: themeColors.accent,
    background: themeColors.background,
    card: themeColors.surface,
    text: themeColors.textPrimary,
    border: themeColors.border,
    notification: themeColors.accent,
  };
}

const ThemeContext = createContext<Theme>(DARK_THEME);

export function ThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode;
  children: React.ReactNode;
}) {
  const system = (useColorScheme() || 'dark') as ThemeScheme;
  const scheme = resolveThemeScheme(mode, system);

  const theme = useMemo(() => (scheme === 'dark' ? DARK_THEME : LIGHT_THEME), [scheme]);

  return React.createElement(ThemeContext.Provider, { value: theme }, children as any);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export const THEME = DARK_THEME;
