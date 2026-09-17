import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeHeroSwipeHintStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: 14,
      gap: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textSecondary,
    },
    activeDot: {
      width: 14,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.accent,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
  });

export type HomeHeroSwipeHintStyles = ReturnType<typeof createHomeHeroSwipeHintStyles>;
