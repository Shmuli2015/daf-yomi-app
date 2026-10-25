import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import type { Theme } from '../../theme';

const startEdgeBorder: ViewStyle =
  Platform.OS === 'web' ? { borderRightWidth: 3 } : { borderLeftWidth: 3 };

export function mishnahStartBorderColor(color: string): ViewStyle {
  return Platform.OS === 'web' ? { borderRightColor: color } : { borderLeftColor: color };
}

export function createMishnahJoinStyles(theme: Theme, gap: number) {
  const radius = theme.radius.sm;

  return StyleSheet.create({
    solo: {
      ...startEdgeBorder,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: radius,
    },
    start: {
      ...startEdgeBorder,
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
      ...startEdgeBorder,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 0,
      marginBottom: -(gap + 1),
    },
    end: {
      ...startEdgeBorder,
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
