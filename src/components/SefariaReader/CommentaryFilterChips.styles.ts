import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createCommentaryFilterChipsStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      direction: 'rtl',
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    chipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      writingDirection: 'rtl',
    },
    chipTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
      writingDirection: 'rtl',
    },
  });
}
