import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createToastStyles(theme: Theme) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 50,
      elevation: 50,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      direction: 'rtl',
      ...theme.shadow.cardMedium,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
      alignSelf: 'stretch',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      width: '100%',
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      width: '100%',
    },
  });
}
