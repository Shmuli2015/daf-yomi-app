import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createHomeUpcomingMasechetBannerStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      borderRadius: 28,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      paddingVertical: 14,
      paddingHorizontal: 16,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadow.cardMedium,
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    infoGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
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
      fontSize: 19,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      lineHeight: 23,
    },
    timingSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    actionsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    compactShareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    compactShareBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    closeButton: {
      padding: 6,
    },
  });
}
