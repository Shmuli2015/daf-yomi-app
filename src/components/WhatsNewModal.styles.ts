import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createWhatsNewModalStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      width: '100%',
      alignItems: 'stretch',
      direction: 'rtl',
      paddingTop: 8,
      paddingBottom: 8,
    },
    closeRow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      direction: 'ltr',
      zIndex: 2,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 12,
      paddingTop: 4,
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.accent,
      textAlign: 'center',
      marginBottom: 8,
    },
    versionBadge: {
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      borderRadius: theme.radius.full,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    versionText: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: '800',
    },
  });
}
