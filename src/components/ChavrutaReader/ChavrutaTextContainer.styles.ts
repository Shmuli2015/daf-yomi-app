import { Platform, StyleSheet } from 'react-native';
import { LIGHT_THEME, type Theme } from '../../theme';

export function createChavrutaTextContainerStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';
  const onAccent = LIGHT_THEME.colors.surface;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      direction: 'rtl',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 40,
      gap: 14,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 12,
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.textMuted,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.textPrimary,
    },
    errorSub: {
      fontSize: 13,
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.textMuted,
    },
    retryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: theme.radius.sm,
      marginTop: 8,
      backgroundColor: theme.colors.accent,
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
      borderBottomColor: theme.colors.border,
    },
    titleHe: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.accent,
    },
    paragraph: {
      gap: 8,
      alignSelf: 'stretch',
      width: '100%',
    },
    paragraphText: {
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
      color: theme.colors.textPrimary,
    },
  });
}
