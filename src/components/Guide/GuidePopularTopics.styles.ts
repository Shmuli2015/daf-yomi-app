import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuidePopularTopicsStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
      direction: 'rtl',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    headerTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    card: {
      width: '48.5%',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      direction: 'rtl',
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    label: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    hint: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
  });
}
