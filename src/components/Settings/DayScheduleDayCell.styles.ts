import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createDayScheduleDayCellStyles(theme: Theme) {
  return StyleSheet.create({
    cell: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      gap: 6,
      minHeight: 64,
    },
    cellEnabled: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    dayLetter: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textMuted,
    },
    dayLetterEnabled: {
      color: theme.colors.accent,
    },
    timeText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: 0.2,
    },
    disabledText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
  });
}
