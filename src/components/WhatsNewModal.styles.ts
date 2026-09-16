import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createWhatsNewModalStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      width: '100%',
      alignItems: 'stretch',
      direction: 'rtl',
    },
    iconWrap: {
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 19,
      fontWeight: '900',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    body: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 12,
      width: '100%',
    },
    primaryBtn: {
      backgroundColor: theme.colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryLabel: {
      color: theme.colors.white,
      fontWeight: '900',
      fontSize: 16,
    },
  });
}
