import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeHeaderStyles = (_theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outerContainer: {
      position: 'relative',
    },
  });

export type HomeHeaderStyles = ReturnType<typeof createHomeHeaderStyles>;
