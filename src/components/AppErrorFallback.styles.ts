import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createAppErrorFallbackStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      direction: 'rtl',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'stretch',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      paddingVertical: 28,
      paddingHorizontal: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'stretch',
      ...theme.shadow.card,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 18,
    },
    title: {
      width: '100%',
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      marginBottom: 10,
    },
    message: {
      width: '100%',
      alignSelf: 'stretch',
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: '500',
      textAlign: 'center',
      writingDirection: 'rtl',
      marginBottom: 24,
    },
    button: {
      alignSelf: 'stretch',
      backgroundColor: theme.colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    buttonText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
    },
  });
}
