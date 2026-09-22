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
    headerTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
      direction: 'rtl',
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
    categoryText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.accent,
      marginBottom: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    questionText: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      lineHeight: 21,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    questionHighlight: {
      backgroundColor: theme.colors.accentLight,
      color: theme.colors.accent,
      fontWeight: '900',
    },
    answerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 4,
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
