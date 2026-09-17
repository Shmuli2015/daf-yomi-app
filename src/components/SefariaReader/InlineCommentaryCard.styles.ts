import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createInlineCommentaryCardStyles(_theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';

  return StyleSheet.create({
    container: {
      gap: 4,
      alignSelf: 'stretch',
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    commentatorTitle: {
      fontSize: 14,
      fontWeight: '800',
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    text: {
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
    },
  });
}
