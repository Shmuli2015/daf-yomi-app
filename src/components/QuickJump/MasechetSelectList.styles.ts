import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export const MASECHET_ITEM_HEIGHT = 44;

export function createMasechetSelectListStyles(theme: Theme) {
  return StyleSheet.create({
    listWrap: {
      flex: 1,
      minHeight: 0,
      marginBottom: 14,
      overflow: 'hidden',
    },
    list: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
    },
    item: {
      height: MASECHET_ITEM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    itemSelected: {
      backgroundColor: theme.colors.accentLight,
    },
    itemText: {
      fontSize: 15,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    itemTextSelected: {
      color: theme.colors.accent,
      fontWeight: '700',
    },
    badge: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
  });
}
