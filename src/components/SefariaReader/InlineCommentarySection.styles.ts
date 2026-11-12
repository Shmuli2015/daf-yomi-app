import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createInlineCommentarySectionStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      direction: 'rtl',
      marginTop: 8,
      marginBottom: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 12,
      alignSelf: 'stretch',
      width: '100%',
      borderRadius: theme.radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
    },
    emptyContainer: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    emptyText: {
      fontSize: 13,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
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
