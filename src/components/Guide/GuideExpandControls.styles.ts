import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideExpandControlsStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 16,
      marginBottom: 10,
      paddingHorizontal: 4,
      direction: 'rtl',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    textActive: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
      writingDirection: 'rtl',
    },
    textDisabled: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      writingDirection: 'rtl',
    },
  });
}
