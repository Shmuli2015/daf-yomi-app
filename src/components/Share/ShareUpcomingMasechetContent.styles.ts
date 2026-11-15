import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';
import { getShareCardPalette } from './shareCardTheme';

export function createShareUpcomingMasechetContentStyles(theme: Theme, isDark: boolean) {
  const palette = getShareCardPalette(theme, isDark);
  const textColor = palette.textPrimary;
  const mutedColor = palette.textSecondary;
  const cardBg = palette.cardBg;
  const quoteBg = palette.quoteBg;

  return StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    topPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 28,
      borderRadius: theme.radius.full,
      backgroundColor: cardBg,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      marginBottom: 20,
    },
    topPillText: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    crestOuterRing: {
      width: 190,
      height: 190,
      borderRadius: 95,
      borderWidth: 2,
      borderColor: theme.colors.cardFrameBorder,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(201,150,60,0.06)' : 'rgba(201,150,60,0.08)',
      marginBottom: 20,
    },
    crestInnerRing: {
      width: 166,
      height: 166,
      borderRadius: 83,
      backgroundColor: isDark ? 'rgba(201,150,60,0.15)' : 'rgba(201,150,60,0.16)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
    },
    announceText: {
      fontSize: 34,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: 1,
      textAlign: 'center',
      marginBottom: 8,
    },
    masechetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      marginBottom: 24,
      width: '100%',
      paddingHorizontal: 20,
    },
    masechetFlourish: {
      height: 2,
      flex: 1,
      maxWidth: 100,
      backgroundColor: theme.colors.cardFrameBorder,
      borderRadius: theme.radius.full,
    },
    masechetName: {
      fontSize: 66,
      fontWeight: '900',
      color: textColor,
      letterSpacing: -1,
      textAlign: 'center',
    },
    timingCard: {
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 40,
      borderRadius: theme.radius.xl,
      backgroundColor: cardBg,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      marginBottom: 24,
      maxWidth: 640,
      width: '100%',
    },
    timingBadgeText: {
      fontSize: 34,
      fontWeight: '900',
      color: theme.colors.accent,
      textAlign: 'center',
      marginBottom: 4,
    },
    timingDateText: {
      fontSize: 22,
      fontWeight: '700',
      color: mutedColor,
      textAlign: 'center',
    },
    inviteBanner: {
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: theme.radius.md,
      backgroundColor: quoteBg,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
      maxWidth: 720,
      alignSelf: 'center',
    },
    inviteHeadline: {
      fontSize: 22,
      fontWeight: '800',
      color: textColor,
      textAlign: 'center',
      marginBottom: 4,
      writingDirection: 'rtl',
    },
    inviteSubtext: {
      fontSize: 19,
      fontWeight: '700',
      color: theme.colors.accent,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
  });
}
