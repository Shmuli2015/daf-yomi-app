import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeShasCardStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    shasCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    shasRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    shasIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    shasCopy: {
      flex: 1,
    },
    shasTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    shasCount: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    shasPctContainer: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      gap: 6,
    },
    shasPct: {
      color: theme.colors.accent,
      fontSize: 22,
      fontWeight: '900',
    },
    progressBarBg: {
      height: 5,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 3,
      overflow: 'hidden',
      marginTop: 14,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 3,
    },
  });

export type HomeShasCardStyles = ReturnType<typeof createHomeShasCardStyles>;
