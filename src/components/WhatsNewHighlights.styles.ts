import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createWhatsNewHighlightsStyles(theme: Theme) {
  return StyleSheet.create({
    list: {
      width: '100%',
      alignSelf: 'stretch',
      maxHeight: 200,
      marginBottom: 16,
      direction: 'rtl',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: 8,
      gap: 8,
    },
    bullet: {
      color: theme.colors.accent,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '800',
    },
    text: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '600',
      writingDirection: 'rtl',
    },
  });
}
