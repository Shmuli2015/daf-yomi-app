import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createShareStreakContentStyles(theme: Theme, isDark: boolean) {
  const textColor = isDark ? theme.colors.textPrimary : theme.colors.primary;
  const mutedColor = isDark ? theme.colors.textSecondary : theme.colors.textMuted;
  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)';
  const quoteBg = isDark ? 'rgba(201,150,60,0.09)' : 'rgba(201,150,60,0.08)';

  return StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    milestonePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 28,
      borderRadius: theme.radius.full,
      backgroundColor: pillBg,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      marginBottom: 28,
    },
    milestoneText: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    flameOuterRing: {
      width: 220,
      height: 220,
      borderRadius: 110,
      borderWidth: 2,
      borderColor: theme.colors.cardFrameBorder,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(201,150,60,0.06)' : 'rgba(201,150,60,0.08)',
      marginBottom: 20,
    },
    flameInnerRing: {
      width: 196,
      height: 196,
      borderRadius: 98,
      backgroundColor: isDark ? 'rgba(201,150,60,0.14)' : 'rgba(201,150,60,0.16)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
    },
    streakNumber: {
      fontSize: 144,
      fontWeight: '900',
      color: textColor,
      lineHeight: 148,
      letterSpacing: -4,
      textAlign: 'center',
    },
    streakLabel: {
      fontSize: 42,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: -0.5,
      textAlign: 'center',
      marginTop: -4,
      marginBottom: 28,
    },
    datePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 36,
      borderRadius: theme.radius.full,
      backgroundColor: pillBg,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorder,
      marginBottom: 22,
    },
    dateText: {
      fontSize: 26,
      fontWeight: '700',
      color: mutedColor,
      textAlign: 'center',
    },
    quoteContainer: {
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: theme.radius.md,
      backgroundColor: quoteBg,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
      maxWidth: 720,
      alignSelf: 'center',
    },
    quoteText: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.accent,
      textAlign: 'center',
      letterSpacing: 0.5,
      writingDirection: 'rtl',
    },
  });
}
