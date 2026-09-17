import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideFaqListStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      direction: 'rtl',
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    controlBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    controlBtnTextMuted: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 36,
      paddingHorizontal: 20,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    clearSearchBtn: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.accentLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accent,
    },
    clearSearchBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
  });
}
