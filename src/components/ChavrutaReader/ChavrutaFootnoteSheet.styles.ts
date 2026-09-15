import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createChavrutaFootnoteSheetStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';

  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      direction: 'rtl',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
      writingDirection: 'rtl',
      textAlign: textAlignment,
      flex: 1,
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      maxHeight: 360,
    },
    bodyContent: {
      paddingBottom: 12,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      lineHeight: 26,
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
    },
  });
}
