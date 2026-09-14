import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createQuickJumpButtonStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: 12,
      height: 44,
      gap: 6,
      ...theme.shadow.card,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
  });
}
