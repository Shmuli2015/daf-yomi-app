import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createQuickJumpButtonStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      borderRadius: theme.radius.full,
      paddingHorizontal: 14,
      height: 40,
      gap: 6,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
  });
}
