import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createNotifModeToggleStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
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
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 10,
      zIndex: 1,
    },
    btnActiveFallback: {
      backgroundColor: theme.colors.accent,
    },
    btnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    btnTextActive: {
      color: theme.colors.white,
      fontWeight: '800',
    },
  });
}
