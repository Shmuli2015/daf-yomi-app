import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';
import { getShareCardPalette } from '../Share/shareCardTheme';

export function createSiyumShareCardStyles(theme: Theme, isDark: boolean) {
  const palette = getShareCardPalette(theme, isDark);
  const textColor = palette.textPrimary;
  const mutedColor = palette.textSecondary;
  const pillBg = palette.cardBg;
  const hadranBg = palette.quoteBg;

  return StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    crownOuterRing: {
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
    crownInnerRing: {
      width: 166,
      height: 166,
      borderRadius: 83,
      backgroundColor: isDark ? 'rgba(201,150,60,0.15)' : 'rgba(201,150,60,0.16)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
    },
    congratsTitle: {
      fontSize: 76,
      fontWeight: '900',
      color: theme.colors.accent,
      letterSpacing: 2,
      textAlign: 'center',
      lineHeight: 82,
      marginBottom: 6,
    },
    completionSubtitle: {
      fontSize: 30,
      fontWeight: '700',
      color: mutedColor,
      textAlign: 'center',
      marginBottom: 10,
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
    flourishLine: {
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
    pagesPill: {
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: theme.radius.full,
      backgroundColor: pillBg,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      marginBottom: 24,
    },
    pagesText: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    hadranCard: {
      paddingVertical: 18,
      paddingHorizontal: 40,
      borderRadius: theme.radius.md,
      backgroundColor: hadranBg,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
      maxWidth: 760,
      alignSelf: 'center',
    },
    hadranLine1: {
      fontSize: 24,
      fontWeight: '800',
      color: textColor,
      textAlign: 'center',
      marginBottom: 4,
      writingDirection: 'rtl',
    },
    hadranLine2: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.accent,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
  });
}
