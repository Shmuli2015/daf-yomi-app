import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createTzuratNavigationStyles = (
  theme: ReturnType<typeof useTheme>,
  isLandscape: boolean,
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: isLandscape ? 8 : 12,
      paddingTop: isLandscape ? 4 : 6,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: isLandscape ? 2 : 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isLandscape ? 4 : 8,
    },
    btn: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnAmud: {
      flex: 1,
      minHeight: 44,
      paddingVertical: isLandscape ? 4 : 6,
      paddingHorizontal: 4,
    },
    btnDaf: {
      flexGrow: 0,
      flexShrink: 0,
      minWidth: 44,
      minHeight: 44,
      paddingHorizontal: 4,
    },
    btnInner: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isLandscape ? 2 : 4,
    },
    btnDisabled: {
      opacity: 0.45,
    },
    btnText: {
      color: theme.colors.textPrimary,
      fontSize: isLandscape ? 11 : 13,
      fontWeight: '700',
      textAlign: 'center',
    },
    btnTextDisabled: {
      color: theme.colors.textSecondary,
    },
  });

export type TzuratNavigationStyles = ReturnType<typeof createTzuratNavigationStyles>;
