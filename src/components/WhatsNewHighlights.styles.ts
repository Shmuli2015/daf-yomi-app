import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createWhatsNewHighlightsStyles(_theme: Theme) {
  return StyleSheet.create({
    list: {
      width: '100%',
      alignSelf: 'stretch',
      direction: 'rtl',
    },
    listContent: {
      paddingBottom: 4,
      flexGrow: 0,
    },
  });
}
