import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createReaderSearchBarStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      width: '100%',
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      direction: 'rtl',
    },
    inputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.accentLight,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 10,
      minHeight: 36,
      gap: 6,
      direction: 'rtl',
    },
    input: {
      flex: 1,
      width: '100%',
      fontSize: 15,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      textAlign: 'right',
      writingDirection: 'rtl',
      padding: 0,
    },
    counter: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
      writingDirection: 'rtl',
      minWidth: 44,
      textAlign: 'center',
    },
    iconBtn: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
