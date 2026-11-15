import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createHomeUpcomingMasechetBannerStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginTop: 16,
      marginHorizontal: 20,
      borderRadius: 28,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      padding: 18,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadow.cardMedium,
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    },
    infoGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textCol: {
      flex: 1,
      alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
    },
    eyebrowPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.accentLight,
      marginBottom: 3,
    },
    eyebrowText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    masechetTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      lineHeight: 24,
    },
    timingSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
  });
}
