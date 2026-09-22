import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideGesturesCardStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
      overflow: 'hidden',
      direction: 'rtl',
    },
    headerTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 12,
      direction: 'rtl',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    headerIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleWrap: {
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
      marginTop: 1,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    itemsContainer: {
      paddingHorizontal: 14,
      paddingBottom: 12,
      paddingTop: 8,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    gestureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 4,
    },
    gestureIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    gestureTextWrap: {
      flex: 1,
    },
    gestureTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 2,
    },
    gestureTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
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
      fontSize: 10.5,
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
