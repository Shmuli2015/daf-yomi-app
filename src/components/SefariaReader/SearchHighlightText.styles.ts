import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createSearchHighlightTextStyles(theme: Theme) {
  return StyleSheet.create({
    match: {
      backgroundColor: theme.colors.accentLight,
      color: theme.colors.accent,
      fontWeight: '800',
    },
    activeMatch: {
      backgroundColor: theme.colors.accentBorder,
      color: theme.colors.accent,
      fontWeight: '900',
    },
  });
}
