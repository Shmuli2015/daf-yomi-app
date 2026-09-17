import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createReaderSkeletonStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 14,
    },
    headerPlaceholder: {
      height: 28,
      width: '40%',
      alignSelf: 'center',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    card: {
      padding: 16,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 10,
    },
    lineLong: {
      height: 16,
      width: '100%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    lineMedium: {
      height: 16,
      width: '75%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    lineShort: {
      height: 16,
      width: '45%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    badgePlaceholder: {
      height: 22,
      width: 90,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
      marginTop: 4,
    },
  });
}
