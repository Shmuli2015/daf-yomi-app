import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createTimePickerModalStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
      direction: 'rtl',
    },
    headerIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    pickerBox: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    wheelRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
    },
    wheelColumn: {
      alignItems: 'center',
    },
    wheelLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    colon: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.textMuted,
      marginTop: 16,
    },
    actions: {
      width: '100%',
      gap: 10,
    },
    saveBtn: {
      width: '100%',
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    saveBtnText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '800',
    },
    secondaryBtn: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    secondaryBtnText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    disableBtnText: {
      color: theme.colors.danger,
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
