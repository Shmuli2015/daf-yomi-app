import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createTzuratNavigationStyles = (
  theme: ReturnType<typeof useTheme>,
  isLandscape: boolean,
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: isLandscape ? 4 : 8,
      paddingHorizontal: isLandscape ? 8 : 12,
      paddingTop: isLandscape ? 6 : 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    btn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isLandscape ? 6 : 10,
      paddingHorizontal: 4,
      borderRadius: isLandscape ? 10 : 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: isLandscape ? 2 : 4,
    },
    btnCompact: {
      flex: 0.85,
    },
    btnDisabled: {
      opacity: 0.45,
    },
    btnText: {
      color: theme.colors.textPrimary,
      fontSize: isLandscape ? 9 : 11,
      fontWeight: '800',
      textAlign: 'center',
    },
    btnTextCompact: {
      fontSize: isLandscape ? 8 : 10,
    },
    btnTextDisabled: {
      color: theme.colors.textSecondary,
    },
  });

export type TzuratNavigationStyles = ReturnType<typeof createTzuratNavigationStyles>;
