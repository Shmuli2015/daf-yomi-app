import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createCommentaryFilterChipsStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      direction: 'rtl',
    },
    chip: {
      alignSelf: 'flex-start',
      flexGrow: 0,
      flexShrink: 0,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      writingDirection: 'rtl',
      textAlign: 'center',
      includeFontPadding: false,
      lineHeight: 16,
    },
    chipTextActive: {
      color: theme.colors.white,
      fontWeight: '700',
      writingDirection: 'rtl',
    },
  });
}
