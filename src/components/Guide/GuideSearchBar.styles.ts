import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideSearchBarStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 10,
      direction: 'rtl',
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
      padding: 0,
    },
    clearButton: {
      padding: 4,
    },
  });
}
