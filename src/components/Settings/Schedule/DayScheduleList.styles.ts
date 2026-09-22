import { StyleSheet } from 'react-native';
import type { Theme } from '../../../theme';

export function createDayScheduleListStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      paddingVertical: 14,
      backgroundColor: theme.colors.surface,
      direction: 'rtl',
    },
    weekGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cellSlot: {
      width: '25%',
      padding: 5,
    },
  });
}
