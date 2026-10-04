import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideSectionStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 12,
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
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleWrap: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    subtitle: {
      fontSize: 11.5,
      color: theme.colors.textMuted,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
    },
    countText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    itemsList: {
      paddingHorizontal: 14,
      paddingBottom: 8,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
  });
}
