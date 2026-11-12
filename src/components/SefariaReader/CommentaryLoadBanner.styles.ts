import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createCommentaryLoadBannerStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.dangerLight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.danger,
      direction: 'rtl',
    },
    message: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.danger,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    retryBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.danger,
    },
    retryText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
    dismissBtn: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
