import { StyleSheet, I18nManager } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideTabToggleStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      direction: 'ltr',
    },
    indicator: {
      position: 'absolute',
      top: 3,
      bottom: 3,
      borderRadius: 10,
      backgroundColor: theme.colors.accent,
    },
    tabBtn: {
      flex: 1,
      flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 9,
      borderRadius: 10,
      zIndex: 1,
    },
    tabBtnActiveFallback: {
      backgroundColor: theme.colors.accent,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.white,
      fontWeight: '800',
    },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
      backgroundColor: theme.colors.border,
    },
    badgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    badgeTextActive: {
      color: theme.colors.white,
    },
  });
}
