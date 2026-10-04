import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createSettingsOverviewCardStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    topGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 48,
    },
    tilesRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: 14,
      paddingHorizontal: 8,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      gap: 6,
    },
    tileBorder: {
      borderStartWidth: 1,
      borderStartColor: theme.colors.border,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    tileLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    tileSubtitle: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}

export type SettingsOverviewCardStyles = ReturnType<typeof createSettingsOverviewCardStyles>;
