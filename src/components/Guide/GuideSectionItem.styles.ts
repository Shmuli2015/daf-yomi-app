import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideSectionItemStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 10,
      direction: 'rtl',
    },
    indexBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    indexText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    contentWrap: {
      flex: 1,
      gap: 4,
    },
    leadTitle: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    leadHighlight: {
      color: theme.colors.accent,
      fontWeight: '900',
    },
    bodyText: {
      fontSize: 13.5,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    bodyTextBold: {
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
  });
}
