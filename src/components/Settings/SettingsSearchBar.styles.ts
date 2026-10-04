import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createSettingsSearchBarStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    containerFocused: {
      borderColor: theme.colors.accent,
    },
    searchIcon: {
      marginStart: 2,
      marginEnd: 10,
    },
    input: {
      flex: 1,
      fontSize: 14.5,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      textAlign: 'start' as any,
      writingDirection: 'rtl',
      padding: 0,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.accentLight,
      marginHorizontal: 6,
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    clearBtn: {
      padding: 2,
      marginStart: 4,
    },
  });
}

export type SettingsSearchBarStyles = ReturnType<typeof createSettingsSearchBarStyles>;
