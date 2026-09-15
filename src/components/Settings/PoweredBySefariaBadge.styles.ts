import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createPoweredBySefariaBadgeStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    badgeImage: {
      width: 132,
      height: 26,
    },
    fallbackText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      writingDirection: 'rtl',
    },
  });
}
