import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export const createDafMarkMenuStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      direction: 'rtl',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 4,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    optionText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    optionTextDone: {
      color: theme.colors.success,
    },
    unmarkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: 'rgba(239,68,68,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
      marginBottom: 10,
    },
    unmarkText: {
      color: theme.colors.danger,
      fontSize: 16,
      fontWeight: '700',
    },
    cancelButton: {
      marginTop: 6,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
  });

