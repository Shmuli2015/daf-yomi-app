import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideQuickNavStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
      direction: 'rtl',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      paddingHorizontal: 2,
    },
    headerTitle: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.textMuted,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    scrollContent: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 2,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pillActive: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    label: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    labelActive: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
  });
}
