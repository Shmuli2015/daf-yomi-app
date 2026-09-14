import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createFullscreenExitButtonStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      alignSelf: 'center',
      zIndex: 9999,
      elevation: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      opacity: 0.95,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
      ...theme.shadow.cardMedium,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
  });
}
