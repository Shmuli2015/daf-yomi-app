import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideGesturesCardStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 8,
      marginBottom: 14,
      padding: 14,
      direction: 'rtl',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    headerIconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextWrap: {
      flex: 1,
    },
    title: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.primary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    subtitle: {
      fontSize: 11.5,
      color: theme.colors.textMuted,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    itemsList: {
      gap: 10,
    },
    gestureCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
    },
    gestureIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    gestureContent: {
      flex: 1,
      gap: 2,
    },
    gestureTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    gestureTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      flex: 1,
    },
    gestureBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    gestureBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.accent,
      writingDirection: 'rtl',
    },
    gestureDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
  });
}
