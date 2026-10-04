import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createCalendarGridSkeletonStyles(theme: Theme) {
  return StyleSheet.create({
    grid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: '14.28%',
      paddingHorizontal: 2,
      paddingVertical: 2.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCard: {
      width: '100%',
      height: 52,
      borderRadius: 11,
      backgroundColor: theme.colors.border,
    },
  });
}
