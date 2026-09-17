import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createReadingProgressBarStyles(theme: Theme) {
  return StyleSheet.create({
    track: {
      height: 3,
      width: '100%',
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
    },
    indicator: {
      height: '100%',
      backgroundColor: theme.colors.accent,
    },
  });
}
