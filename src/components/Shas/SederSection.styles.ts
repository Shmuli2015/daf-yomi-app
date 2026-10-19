import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createSederSectionStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    headerContainer: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    accentBar: {
      width: 3.5,
      alignSelf: 'stretch',
      minHeight: 38,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.accent,
    },
    titleInfo: {
      flex: 1,
      gap: 2,
    },
    sederName: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: 1,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    statLine: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      lineHeight: 16,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    percentageBadge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    percentageBadgeComplete: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    percentageText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    percentageTextComplete: {
      color: theme.colors.surface,
    },
    chevronBox: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressTrack: {
      height: 3.5,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 10,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    contentContainer: {
      paddingHorizontal: 12,
      paddingBottom: 16,
    },
    contentDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 12,
      opacity: 0.6,
    },
  });
}
