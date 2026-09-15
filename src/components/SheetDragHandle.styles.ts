import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createSheetDragHandleStyles(theme: Theme) {
  return StyleSheet.create({
    hitArea: {
      width: '100%',
      alignItems: 'center',
      alignSelf: 'stretch',
      justifyContent: 'center',
      minHeight: 44,
      paddingTop: 14,
      paddingBottom: 12,
    },
    hitAreaWithContent: {
      minHeight: 0,
      paddingBottom: 0,
      justifyContent: 'flex-start',
    },
    bar: {
      width: 42,
      height: 4.5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.border,
    },
  });
}
