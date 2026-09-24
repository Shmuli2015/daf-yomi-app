import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createReaderSkeletonStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 16,
      direction: 'rtl',
      overflow: 'hidden',
    },
    header: {
      alignItems: 'center',
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    titleLine: {
      height: 22,
      width: '46%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    paragraph: {
      alignSelf: 'stretch',
      width: '100%',
      gap: 8,
      alignItems: 'flex-start',
    },
    lineLong: {
      height: 14,
      width: '100%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    lineMedium: {
      height: 14,
      width: '78%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    lineShort: {
      height: 14,
      width: '52%',
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
    },
    badge: {
      height: 22,
      width: 108,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.border,
      marginTop: 2,
    },
  });
}
