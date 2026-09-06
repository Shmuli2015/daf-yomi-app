import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeContentStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    streakCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadow.cardMedium,
    },
    shareButtonRow: {
      position: 'absolute',
      top: 16,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingEnd: 24,
      zIndex: 1,
    },
    streakInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    streakIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 20,
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
      fontSize: 32,
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
      marginVertical: 24,
    },
    chartWrapper: {
      gap: 16,
    },
    chartTitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 100,
    },
    barColumn: {
      alignItems: 'center',
      gap: 8,
    },
    barBg: {
      width: 12,
      height: 60,
      backgroundColor: theme.colors.progressTrack + '40',
      borderRadius: 6,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      borderRadius: 6,
    },
    dayLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    todayLabel: {
      color: theme.colors.accent,
    },
  });

export type HomeContentStyles = ReturnType<typeof createHomeContentStyles>;
