import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createSefariaTextContainerStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 32,
      gap: 8,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 12,
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
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    headerBox: {
      alignItems: 'center',
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      marginBottom: 4,
    },
    titleHe: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.accent,
    },
  });
}
