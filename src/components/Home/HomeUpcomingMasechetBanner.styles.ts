import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createHomeUpcomingMasechetBannerStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      padding: 16,
      marginBottom: 16,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadow.cardMedium,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    iconTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorder,
    },
    headline: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    closeButton: {
      padding: 4,
    },
    body: {
      marginBottom: 14,
    },
    masechetTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      marginBottom: 2,
    },
    timingSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    shareInviteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: theme.radius.md,
      alignSelf: 'stretch',
      ...theme.shadow.gold,
    },
    shareInviteButtonText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
  });
}
