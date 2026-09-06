import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createSettingItemStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 14,
    },
    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.15)',
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 12.5,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
      opacity: 0.85,
    },
    highlight: {
      backgroundColor: theme.colors.accentLight,
      color: theme.colors.accent,
      fontWeight: '900',
    },
    right: {
      paddingStart: 10,
    },
    arrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.2)',
    },
    valueText: {
      fontSize: 13,
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });

export type SettingItemStyles = ReturnType<typeof createSettingItemStyles>;
