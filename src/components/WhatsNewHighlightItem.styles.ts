import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createWhatsNewHighlightItemStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      alignSelf: 'stretch',
      paddingVertical: 10,
      gap: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    indexBadge: {
      width: 22,
      height: 22,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    indexText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
    text: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '600',
      writingDirection: 'rtl',
    },
  });
}
