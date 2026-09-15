import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

export const createCatchUpModalStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: 4,
      paddingBottom: 20,
      direction: 'rtl',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    countSummary: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    toggleAllBtn: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    toggleAllText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    list: {
      maxHeight: 260,
      marginBottom: 16,
    },
    listContent: {
      gap: 8,
      paddingVertical: 2,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemRowSelected: {
      backgroundColor: theme.colors.accentLight + '40',
      borderColor: theme.colors.accent,
    },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    itemTextContainer: {
      alignItems: 'flex-start',
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    itemTitleSelected: {
      color: theme.colors.accent,
    },
    itemHebDate: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    itemLeftBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    footer: {
      marginTop: 4,
    },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.colors.accent,
      gap: 8,
      ...theme.shadow.card,
    },
    confirmBtnDisabled: {
      opacity: 0.5,
    },
    confirmBtnText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: '900',
    },
  });
