import { Platform, StyleSheet } from 'react-native';
import { LIGHT_THEME, type Theme } from '../../theme';
import type { ReaderThemePalette } from '../../utils/readerTheme';

export function createChavrutaTextContainerStyles(theme: Theme, palette?: ReaderThemePalette) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';
  const onAccent = LIGHT_THEME.colors.surface;
  const bgColor = palette ? palette.backgroundColor : theme.colors.background;
  const textColor = palette ? palette.textColor : theme.colors.textPrimary;
  const mutedColor = palette ? palette.subTextColor : theme.colors.textMuted;
  const accentColor = palette ? palette.accentColor : theme.colors.accent;
  const borderColor = palette ? palette.borderColor : theme.colors.border;
  const mishnahBorder = palette
    ? palette.isSepia
      ? 'rgba(180, 83, 9, 0.40)'
      : palette.isDark
      ? 'rgba(201, 150, 60, 0.45)'
      : 'rgba(180, 83, 9, 0.30)'
    : theme.colors.accentBorder;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgColor,
      direction: 'rtl',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 32,
      gap: 14,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 12,
      backgroundColor: bgColor,
    },
    loadingText: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
      writingDirection: 'rtl',
      color: mutedColor,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: textColor,
    },
    errorSub: {
      fontSize: 13,
      textAlign: 'center',
      writingDirection: 'rtl',
      color: mutedColor,
    },
    retryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: theme.radius.sm,
      marginTop: 8,
      backgroundColor: accentColor,
    },
    retryBtnText: {
      color: onAccent,
      fontWeight: '700',
      fontSize: 14,
    },
    headerBox: {
      alignItems: 'center',
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    titleHe: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: accentColor,
    },
    paragraph: {
      gap: 8,
      alignSelf: 'stretch',
      width: '100%',
    },
    mishnahParagraph: {
      borderRightWidth: 3,
      borderRightColor: mishnahBorder,
      paddingRight: 10,
    },
    paragraphText: {
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
      color: textColor,
    },
  });
}
