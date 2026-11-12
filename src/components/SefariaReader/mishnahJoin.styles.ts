import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createMishnahJoinStyles(theme: Theme, gap: number) {
  const radius = theme.radius.sm;

  return StyleSheet.create({
    solo: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: radius,
    },
    start: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginBottom: -(gap + 1),
    },
    middle: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 0,
      marginBottom: -(gap + 1),
    },
    end: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 10,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    },
  });
}
