import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createTzuratStopPointModalStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      direction: 'rtl',
      paddingHorizontal: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 6,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 18,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: theme.colors.textPrimary,
      fontSize: 16,
      textAlign: 'right',
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      marginBottom: 16,
    },
    buttonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.colors.accent,
      paddingVertical: 11,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    deleteButton: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    deleteButtonText: {
      color: theme.colors.danger,
      fontSize: 15,
      fontWeight: '600',
    },
  });
