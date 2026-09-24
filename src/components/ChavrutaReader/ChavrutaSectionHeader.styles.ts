import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createChavrutaSectionHeaderStyles(
  theme: Theme,
  isSepia?: boolean,
  isDark?: boolean,
  customAccentColor?: string,
) {
  const badgeBg = isSepia
    ? 'rgba(180, 83, 9, 0.10)'
    : isDark
    ? 'rgba(245, 158, 11, 0.14)'
    : theme.colors.accentLight;
  const badgeBorder = isSepia
    ? 'rgba(180, 83, 9, 0.22)'
    : isDark
    ? 'rgba(245, 158, 11, 0.30)'
    : theme.colors.accentBorder;
  const textColor = isSepia
    ? '#92400E'
    : isDark
    ? '#FBBF24'
    : (customAccentColor || theme.colors.accent);
  const dividerColor = isSepia
    ? 'rgba(180, 83, 9, 0.20)'
    : isDark
    ? '#27272A'
    : theme.colors.border;

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 12,
      paddingHorizontal: 8,
      gap: 12,
      width: '100%',
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: dividerColor,
    },
    badge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: badgeBg,
      borderWidth: 1,
      borderColor: badgeBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
      color: textColor,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
  });
}
