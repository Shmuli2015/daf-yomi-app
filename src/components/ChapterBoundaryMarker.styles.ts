import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createChapterBoundaryMarkerStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignSelf: 'stretch',
      width: '100%',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      gap: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.accentBorder,
      backgroundColor: theme.colors.accentLight,
      borderRadius: theme.radius.sm,
    },
    heading: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.accent,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.textPrimary,
    },
  });
}
