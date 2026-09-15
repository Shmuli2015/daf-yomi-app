import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createReaderAttributionStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';

  return StyleSheet.create({
    container: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      gap: 4,
      alignSelf: 'stretch',
      width: '100%',
    },
    text: {
      fontSize: 11,
      lineHeight: 16,
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
      direction: 'rtl',
    },
    linkText: {
      fontSize: 11.5,
      fontWeight: '700',
      writingDirection: 'rtl',
    },
  });
}
