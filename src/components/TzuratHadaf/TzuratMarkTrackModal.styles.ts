import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createTzuratMarkTrackModalStyles(theme: Theme) {
  return StyleSheet.create({
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
    optionButtonLearned: {
      borderColor: theme.colors.accentBorder,
    },
    optionTextBlock: {
      flex: 1,
    },
    optionText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    optionStatus: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    optionStatusDone: {
      color: theme.colors.success,
    },
    hint: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 12,
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
}

export type TzuratMarkTrackModalStyles = ReturnType<typeof createTzuratMarkTrackModalStyles>;
