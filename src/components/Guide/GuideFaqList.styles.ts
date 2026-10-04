import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideFaqListStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      direction: 'rtl',
    },
    categoryGroup: {
      marginBottom: 16,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      paddingHorizontal: 4,
      direction: 'rtl',
    },
    groupIconBox: {
      width: 24,
      height: 24,
      borderRadius: 7,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupTitle: {
      fontSize: 13.5,
      fontWeight: '800',
      color: theme.colors.primary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    groupDivider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    groupCount: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
  });
}
