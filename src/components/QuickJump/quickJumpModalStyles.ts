import { StyleSheet, Platform, I18nManager } from 'react-native';
import type { Theme } from '../../theme';

export function createQuickJumpStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
    },
    backdropDim: {
      backgroundColor: 'rgba(0,0,0,0.65)',
    },
    sheetLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      height: 600,
      maxHeight: '75%',
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      direction: 'rtl',
      ...theme.shadow.cardMedium,
    },
    sheetInner: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    titleGroup: {
      flex: 1,
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
    },
    closeButton: {
      padding: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    searchInputContainer: {
      flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      height: 46,
      marginBottom: 12,
    },
    searchIcon: {
      marginEnd: 8,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 15,
      textAlign: 'right',
      writingDirection: 'rtl',
      paddingVertical: 0,
    },
    clearSearchButton: {
      padding: 4,
      marginStart: 4,
    },
    rowFields: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
      alignItems: 'flex-start',
      zIndex: 500,
    },
    dafField: {
      flex: 1,
      zIndex: 500,
    },
    amudField: {
      flex: 1,
      zIndex: 1,
    },
    dropdownTrigger: {
      height: 46,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownTriggerActive: {
      borderColor: theme.colors.accent,
    },
    dropdownValueText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'right',
    },
    amudToggleContainer: {
      flexDirection: 'row',
      height: 46,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    amudButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amudButtonActive: {
      backgroundColor: theme.colors.accent,
    },
    amudButtonDisabled: {
      opacity: 0.35,
    },
    amudButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    amudButtonTextActive: {
      color: theme.colors.surface,
    },
    amudButtonTextDisabled: {
      color: theme.colors.textMuted,
    },
    errorBanner: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.dangerLight,
      borderRadius: theme.radius.sm,
      marginBottom: 14,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.lg,
      gap: 8,
      zIndex: 1,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.surface,
    },
  });
}
