import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';
import { CARD_SIZE } from '../../utils/shareProgressImage';
import { getShareCardPalette } from './shareCardTheme';

export function createShareFrameStyles(theme: Theme, isDark: boolean) {
  const palette = getShareCardPalette(theme, isDark);
  const textColor = palette.textPrimary;
  const mutedColor = palette.textSecondary;
  const chipBg = palette.chipBg;

  return StyleSheet.create({
    root: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      direction: 'rtl',
      overflow: 'hidden',
      backgroundColor: isDark ? theme.colors.cardDarkSurface : theme.colors.cardWarmSurface,
      position: 'relative',
    },
    outerBorder: {
      position: 'absolute',
      top: 32,
      bottom: 32,
      left: 32,
      right: 32,
      borderWidth: 2,
      borderColor: theme.colors.cardFrameBorder,
      borderRadius: theme.radius.lg,
      pointerEvents: 'none',
    },
    innerBorder: {
      position: 'absolute',
      top: 44,
      bottom: 44,
      left: 44,
      right: 44,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
      borderRadius: theme.radius.md,
      pointerEvents: 'none',
    },
    cornerTopLeft: {
      position: 'absolute',
      top: 41,
      left: 41,
      width: 9,
      height: 9,
      backgroundColor: theme.colors.accent,
      transform: [{ rotate: '45deg' }],
    },
    cornerTopRight: {
      position: 'absolute',
      top: 41,
      right: 41,
      width: 9,
      height: 9,
      backgroundColor: theme.colors.accent,
      transform: [{ rotate: '45deg' }],
    },
    cornerBottomLeft: {
      position: 'absolute',
      bottom: 41,
      left: 41,
      width: 9,
      height: 9,
      backgroundColor: theme.colors.accent,
      transform: [{ rotate: '45deg' }],
    },
    cornerBottomRight: {
      position: 'absolute',
      bottom: 41,
      right: 41,
      width: 9,
      height: 9,
      backgroundColor: theme.colors.accent,
      transform: [{ rotate: '45deg' }],
    },
    container: {
      flex: 1,
      paddingTop: 68,
      paddingBottom: 58,
      paddingHorizontal: 64,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      width: '100%',
    },
    headerBrandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 14,
    },
    headerFlourishLine: {
      width: 80,
      height: 2,
      backgroundColor: theme.colors.cardFrameBorder,
      borderRadius: theme.radius.full,
    },
    headerBrandText: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: 2,
      textAlign: 'center',
    },
    categoryChip: {
      paddingVertical: 8,
      paddingHorizontal: 28,
      borderRadius: theme.radius.full,
      backgroundColor: chipBg,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorder,
    },
    categoryChipText: {
      fontSize: 20,
      fontWeight: '700',
      color: textColor,
      textAlign: 'center',
    },
    contentSlot: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
    },
    footer: {
      alignItems: 'center',
      width: '100%',
    },
    footerDivider: {
      height: 2,
      width: '75%',
      backgroundColor: theme.colors.cardFrameBorder,
      borderRadius: theme.radius.full,
      marginBottom: 22,
    },
    brandingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: isDark ? theme.colors.surface : theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorder,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    logoImage: {
      width: 60,
      height: 60,
      borderRadius: 14,
    },
    brandingTextBlock: {
      alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
    },
    appName: {
      fontSize: 30,
      fontWeight: '900',
      color: textColor,
      letterSpacing: -0.5,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    appTagline: {
      fontSize: 19,
      fontWeight: '600',
      color: mutedColor,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
  });
}
