import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createPersonalTrackAddMasechetButtonStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.accentBorder,
      backgroundColor: theme.colors.accentLight,
      direction: 'rtl',
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
      writingDirection: 'rtl',
    },
  });
}
