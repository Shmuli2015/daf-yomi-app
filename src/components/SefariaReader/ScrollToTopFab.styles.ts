import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createScrollToTopFabStyles(theme: Theme) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 24,
      left: 24,
      width: 44,
      height: 44,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99,
      ...theme.shadow.cardMedium,
    },
  });
}
