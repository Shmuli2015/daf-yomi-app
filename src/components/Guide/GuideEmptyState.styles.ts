import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideEmptyStateStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
      gap: 10,
      direction: 'rtl',
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'center',
      writingDirection: 'rtl',
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      writingDirection: 'rtl',
      maxWidth: 320,
    },
    actions: {
      marginTop: 10,
      gap: 8,
      width: '100%',
      maxWidth: 320,
    },
    switchTabBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.accentLight,
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    switchTabText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
      writingDirection: 'rtl',
    },
    askBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.surface,
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    askBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      writingDirection: 'rtl',
    },
    clearBtn: {
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearBtnText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: theme.colors.textMuted,
      writingDirection: 'rtl',
    },
  });
}
