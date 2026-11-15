import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export const createStopPointPresetsRowStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipActive: {
      backgroundColor: theme.colors.accent + '20',
      borderColor: theme.colors.accent,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });
