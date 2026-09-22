import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeHeroSwipeHintStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 12,
      paddingVertical: 2,
    },
    chevron: {
      opacity: 0.65,
    },
    label: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textMuted,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
  });

export type HomeHeroSwipeHintStyles = ReturnType<typeof createHomeHeroSwipeHintStyles>;
