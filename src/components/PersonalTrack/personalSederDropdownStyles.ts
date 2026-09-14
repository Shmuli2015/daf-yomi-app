import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

export const createPersonalSederDropdownStyles = (theme: Theme) =>
  StyleSheet.create({
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    headerTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
      direction: 'rtl',
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    content: {
      paddingHorizontal: 14,
      paddingBottom: 16,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
  });
