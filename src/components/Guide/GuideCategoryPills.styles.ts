import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideCategoryPillsStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
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
      borderRadius: 20,
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
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    labelActive: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeActive: {
      backgroundColor: theme.colors.accent,
    },
    badgeText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    badgeTextActive: {
      color: theme.colors.white,
    },
  });
}
