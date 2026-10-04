import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideFaqItemStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      direction: 'rtl',
    },
    cardExpanded: {
      borderColor: theme.colors.accentBorder,
    },
    headerTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
      direction: 'rtl',
    },
    headerExpanded: {
      backgroundColor: theme.colors.accentLight,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textContainer: {
      flex: 1,
    },
    questionText: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      lineHeight: 21,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    answerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      direction: 'rtl',
    },
    answerText: {
      fontSize: 13.5,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    answerTextBold: {
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
  });
}
