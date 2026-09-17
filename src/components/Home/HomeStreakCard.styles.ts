import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeStreakCardStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    streakCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.cardMedium,
    },
    streakHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    streakInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    streakIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 18,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    streakTitle: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    streakValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    streakValue: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '900',
    },
    streakLabel: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 18,
    },
    chartWrapper: {
      gap: 14,
    },
    chartTitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    chartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 108,
    },
    barColumn: {
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    barBg: {
      width: 12,
      height: 56,
      backgroundColor: theme.colors.progressTrack + '40',
      borderRadius: 6,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    learnedBarBg: {
      backgroundColor: theme.colors.accent,
    },
    selectedBarOutline: {
      borderWidth: 1.5,
      borderColor: theme.colors.accent,
    },
    barFill: {
      width: '100%',
    },
    dayLabelWrapper: {
      alignItems: 'center',
      gap: 3,
    },
    dayLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    todayLabel: {
      color: theme.colors.accent,
    },
    selectedLabel: {
      color: theme.colors.accent,
      fontWeight: '900',
    },
    selectedDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.accent,
    },
    selectedDotEmpty: {
      width: 4,
      height: 4,
    },
    barIndicatorWrapper: {
      height: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    barEmptyIndicator: {
      height: 14,
    },
  });

export type HomeStreakCardStyles = ReturnType<typeof createHomeStreakCardStyles>;
