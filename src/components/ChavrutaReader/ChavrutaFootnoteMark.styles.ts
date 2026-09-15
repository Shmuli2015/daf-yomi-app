import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createChavrutaFootnoteMarkStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';

  return StyleSheet.create({
    pressable: {
      minWidth: 24,
      minHeight: 24,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.radius.sm,
    },
    mark: {
      fontWeight: '800',
      includeFontPadding: false,
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
  });
}
