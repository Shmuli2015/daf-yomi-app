import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export function createOfflineMasechetPickerModalStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';

  return StyleSheet.create({
    content: {
      direction: 'rtl',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      direction: 'rtl',
    },
    headerTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      direction: 'rtl',
    },
    headerIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    titleGroup: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      marginBottom: 10,
      direction: 'rtl',
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.colors.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    pickerList: {
      height: 280,
      marginBottom: 12,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 14,
    },
    emptyStateText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    downloadButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.lg,
      paddingVertical: 14,
      paddingHorizontal: 16,
      direction: 'rtl',
    },
    downloadButtonDisabled: {
      opacity: 0.45,
    },
    downloadButtonText: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.white,
      writingDirection: 'rtl',
    },
  });
}
