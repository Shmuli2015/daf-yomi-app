import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createSupportFormCategoryChipsStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      direction: 'rtl',
      width: '100%',
    },
    chip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight,
    },
    chipText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    chipTextSelected: {
      color: theme.colors.accent,
    },
  });
}
