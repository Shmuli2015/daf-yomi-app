import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createChavrutaFootnoteNavStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 10,
    },
    navBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      direction: 'ltr',
    },
    navBtnDisabled: {
      opacity: 0.35,
    },
    label: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.textPrimary,
    },
  });
}
