import type { Theme } from '../../theme';

export interface ShareCardPalette {
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  chipBg: string;
  quoteBg: string;
  border: string;
  borderGlow: string;
  accent: string;
  goldLight: string;
  goldDark: string;
}

export function getShareCardPalette(theme: Theme, isDark: boolean): ShareCardPalette {
  if (isDark) {
    return {
      surface: theme.colors.cardDarkSurface,
      surfaceSecondary: theme.colors.cardDarkSurfaceSecondary,
      textPrimary: theme.colors.white,
      textSecondary: 'rgba(255,255,255,0.85)',
      textMuted: 'rgba(255,255,255,0.60)',
      cardBg: 'rgba(255,255,255,0.08)',
      chipBg: 'rgba(201,150,60,0.18)',
      quoteBg: 'rgba(201,150,60,0.15)',
      border: theme.colors.cardFrameBorder,
      borderGlow: theme.colors.cardFrameBorderGlow,
      accent: theme.colors.accent,
      goldLight: theme.colors.goldLight,
      goldDark: theme.colors.goldDark,
    };
  }

  return {
    surface: theme.colors.cardWarmSurface,
    surfaceSecondary: theme.colors.cardWarmSurfaceSecondary,
    textPrimary: theme.colors.primary,
    textSecondary: theme.colors.textSecondary,
    textMuted: theme.colors.textMuted,
    cardBg: 'rgba(255,255,255,0.92)',
    chipBg: 'rgba(201,150,60,0.10)',
    quoteBg: 'rgba(201,150,60,0.08)',
    border: theme.colors.cardFrameBorder,
    borderGlow: theme.colors.cardFrameBorderGlow,
    accent: theme.colors.accent,
    goldLight: theme.colors.goldLight,
    goldDark: theme.colors.goldDark,
  };
}
