import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const guideBadgeStyles = StyleSheet.create({
  badgeInline: {
    fontSize: 12,
    fontWeight: '800',
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export const createGuideModalStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    modalSafe: {
      flex: 1,
      backgroundColor: theme.colors.background,
      direction: 'rtl',
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    modalSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtnText: {
      color: theme.colors.accent,
      fontWeight: '700',
      fontSize: 13,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 16,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlign: 'start' as any,
      padding: 0,
    },
    chipsScrollView: {
      marginBottom: 14,
    },
    chipsContainer: {
      gap: 8,
      paddingHorizontal: 2,
    },
    faqChip: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    faqChipSelected: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    faqChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    faqChipTextSelected: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
      marginBottom: 14,
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
    searchResultsInfo: {
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    searchResultsText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
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
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    sectionHeaderTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    sectionCountText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    itemsList: {
      gap: 12,
      paddingHorizontal: 14,
      paddingBottom: 16,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingRight: 4,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.accent,
      marginTop: 7,
    },
    itemText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    itemTextBold: {
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    contactBox: {
      backgroundColor: theme.colors.accentLight,
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    contactIntro: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginBottom: 10,
    },
    contactEmail: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
      marginTop: 20,
      gap: 12,
    },
    footerDivider: {
      width: 40,
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 4,
    },
    footerText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontWeight: '600',
    },
    footerTextBold: {
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    footerEmoji: {
      fontSize: 20,
      marginTop: 4,
    },
  });

export type GuideModalStyles = ReturnType<typeof createGuideModalStyles>;
