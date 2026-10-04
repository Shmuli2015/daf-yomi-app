import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideScrollTopButtonStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      position: 'absolute',
      start: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow.card,
      elevation: 8,
      zIndex: 99,
    },
  });
}
