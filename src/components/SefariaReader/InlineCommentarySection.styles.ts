import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createInlineCommentarySectionStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      direction: 'rtl',
      marginTop: 8,
      marginBottom: 6,
      paddingRight: 12,
      borderRightWidth: 2.5,
      gap: 12,
      alignSelf: 'stretch',
      width: '100%',
    },
    emptyContainer: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    emptyText: {
      fontSize: 13,
      textAlign: 'center',
      writingDirection: 'rtl',
      color: theme.colors.textMuted,
    },
    commentaryList: {
      gap: 14,
      alignSelf: 'stretch',
      width: '100%',
    },
  });
}
