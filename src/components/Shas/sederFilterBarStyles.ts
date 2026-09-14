import { StyleSheet, Platform, I18nManager } from 'react-native';
import type { Theme } from '../../theme';

export function createSederFilterBarStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
      gap: 12,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: 12,
      height: 44,
      ...theme.shadow.card,
    },
    searchIcon: {
      marginEnd: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
      paddingVertical: 0,
    },
    clearButton: {
      padding: 4,
      marginStart: 4,
    },
    horizontalScroll: {
      flexDirection: 'row',
    },
    scrollContent: {
      gap: 8,
      paddingHorizontal: 2,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: theme.colors.surface,
      fontWeight: '700',
    },
    statusScrollContent: {
      gap: 6,
      paddingHorizontal: 2,
    },
    statusChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusChipActive: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accentBorder,
    },
    statusChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    statusChipTextActive: {
      color: theme.colors.accent,
      fontWeight: '700',
    },
    resultsBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      paddingHorizontal: 4,
    },
  });
}
