import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideFaqTabStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      direction: 'rtl',
    },
    activeFilterBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      marginBottom: 12,
      direction: 'rtl',
    },
    activeFilterTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    activeFilterText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    resetFilterBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    resetFilterText: {
      fontSize: 11.5,
      fontWeight: '800',
      color: theme.colors.accent,
      writingDirection: 'rtl',
    },
  });
}
