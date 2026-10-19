import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createAutoScrollFloatingBarStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      alignSelf: 'center',
      zIndex: 100,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 10,
      ...theme.shadow.card,
    },
    playPauseBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    playPauseBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.surface,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    speedSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 3,
      gap: 3,
    },
    speedBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    speedBtnActive: {
      backgroundColor: theme.colors.accent,
    },
    speedBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    speedBtnTextActive: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.surface,
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
}
