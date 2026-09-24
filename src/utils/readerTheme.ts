import type { ReaderTheme } from '../components/SefariaReader/ReaderToolbar';

export interface ReaderThemePalette {
  theme: ReaderTheme;
  isDark: boolean;
  isSepia: boolean;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
}

export function resolveEffectiveReaderTheme(
  storedTheme: string | undefined | null,
  systemIsDark: boolean
): ReaderTheme {
  if (storedTheme === 'sepia' || storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  return systemIsDark ? 'dark' : 'light';
}

export function getNextReaderTheme(current: ReaderTheme): ReaderTheme {
  if (current === 'light') return 'sepia';
  if (current === 'sepia') return 'dark';
  return 'light';
}

export function getReaderThemePalette(
  readerTheme: ReaderTheme,
  appAccentColor?: string
): ReaderThemePalette {
  if (readerTheme === 'sepia') {
    return {
      theme: 'sepia',
      isDark: false,
      isSepia: true,
      backgroundColor: '#FBF0D9',
      surfaceColor: '#F4E6C8',
      textColor: '#2C221E',
      subTextColor: '#8C7462',
      accentColor: '#92400E',
      borderColor: 'rgba(180, 83, 9, 0.20)',
    };
  }

  if (readerTheme === 'dark') {
    return {
      theme: 'dark',
      isDark: true,
      isSepia: false,
      backgroundColor: '#121212',
      surfaceColor: '#1E1E1E',
      textColor: '#FFFFFF',
      subTextColor: '#A1A1AA',
      accentColor: appAccentColor || '#C9963C',
      borderColor: '#27272A',
    };
  }

  return {
    theme: 'light',
    isDark: false,
    isSepia: false,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#0F172A',
    subTextColor: '#64748B',
    accentColor: appAccentColor || '#B45309',
    borderColor: '#E2E8F0',
  };
}
