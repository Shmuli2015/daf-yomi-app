import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createSettingsCollapsibleCardStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    cardOpen: {
      borderColor: theme.colors.accentBorder,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    headerStart: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    titleBlock: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 15.5,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    chevronWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginStart: 8,
    },
    contentDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    body: {
      backgroundColor: theme.colors.surface,
    },
  });
}

export type SettingsCollapsibleCardStyles = ReturnType<typeof createSettingsCollapsibleCardStyles>;
