import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createDafDropdownStyles(theme: Theme) {
  return StyleSheet.create({
    menuContainer: {
      position: 'absolute',
      bottom: 84,
      right: 20,
      width: 210,
      maxWidth: '65%',
      height: 200,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      zIndex: 9999,
      elevation: 25,
      ...theme.shadow.card,
    },
    list: {
      flex: 1,
    },
    item: {
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    itemSelected: {
      backgroundColor: theme.colors.accentLight,
    },
    itemText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'right',
    },
    itemTextSelected: {
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });
}
