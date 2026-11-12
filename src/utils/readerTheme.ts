import type { ReaderTheme } from '../components/SefariaReader/ReaderToolbar';

export interface ReaderThemePalette {
  theme: ReaderTheme;
  isDark: boolean;
  isSepia: boolean;
  backgroundColor: string;
  surfaceColor: string;
  mishnahSurfaceColor: string;
  commentarySurfaceColor: string;
  accentLight: string;
  accentBorder: string;
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

export function getReaderThemeLabel(theme: ReaderTheme): string {
  if (theme === 'sepia') return 'ספיה';
  if (theme === 'dark') return 'כהה';
  return 'בהיר';
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
      mishnahSurfaceColor: 'rgba(180, 83, 9, 0.14)',
      commentarySurfaceColor: 'rgba(180, 83, 9, 0.07)',
      accentLight: 'rgba(180, 83, 9, 0.08)',
      accentBorder: 'rgba(180, 83, 9, 0.20)',
      textColor: '#2C221E',
      subTextColor: '#8C7462',
      accentColor: '#92400E',
      borderColor: 'rgba(180, 83, 9, 0.20)',
    };
  }

  if (readerTheme === 'dark') {
    const accent = appAccentColor || '#C9963C';
    return {
      theme: 'dark',
      isDark: true,
      isSepia: false,
      backgroundColor: '#121212',
      surfaceColor: '#1E1E1E',
      mishnahSurfaceColor: 'rgba(201, 150, 60, 0.18)',
      commentarySurfaceColor: 'rgba(201, 150, 60, 0.10)',
      accentLight: 'rgba(201, 150, 60, 0.10)',
      accentBorder: 'rgba(201, 150, 60, 0.25)',
      textColor: '#FFFFFF',
      subTextColor: '#A1A1AA',
      accentColor: accent,
      borderColor: '#27272A',
    };
  }

  const accent = appAccentColor || '#B45309';
  return {
    theme: 'light',
    isDark: false,
    isSepia: false,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    mishnahSurfaceColor: 'rgba(180, 83, 9, 0.12)',
    commentarySurfaceColor: 'rgba(180, 83, 9, 0.06)',
    accentLight: 'rgba(180, 83, 9, 0.08)',
    accentBorder: 'rgba(180, 83, 9, 0.18)',
    textColor: '#0F172A',
    subTextColor: '#64748B',
    accentColor: accent,
    borderColor: '#E2E8F0',
  };
}
