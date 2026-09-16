import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeContentStyles = (_theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 16,
    },
  });

export type HomeContentStyles = ReturnType<typeof createHomeContentStyles>;
