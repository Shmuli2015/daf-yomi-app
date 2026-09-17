import { StyleSheet, Platform, I18nManager } from 'react-native';
import type { Theme } from '../../theme';

export function createSederFilterBarStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
      gap: 10,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      direction: 'ltr',
      ...theme.shadow.card,
    },
    indicator: {
      position: 'absolute',
      top: 3,
      bottom: 3,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: theme.radius.sm,
      zIndex: 1,
    },
    segmentActiveFallback: {
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    segmentText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    segmentTextActive: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
    resultsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      paddingTop: 2,
    },
    resultsBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    clearAllButton: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    clearAllText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
  });
}
