import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createPersonalTrackBannerStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outerContainer: {
      marginHorizontal: 20,
    },
    emptyContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.accentBorder || theme.colors.border,
      borderStyle: 'dashed',
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    emptyHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16,
    },
    emptyIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitleSection: {
      flex: 1,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    addBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addBtnText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '800',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.cardMedium,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerTag: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.accent,
      textTransform: 'uppercase',
    },
    masechetTitle: {
      fontSize: 17,
      fontWeight: '900',
      color: theme.colors.textPrimary,
    },
    actionButtonsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gridBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.accentLight + '40',
      borderRadius: 10,
    },
    gridBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    changeMasechetBtn: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    changeMasechetText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    progressSection: {
      gap: 8,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    mainStat: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    percentageText: {
      color: theme.colors.accent,
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 30,
    },
    percentageSymbol: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 2,
    },
    countText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '60',
    },
    nextDafInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    nextDafLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    nextDafValue: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textDecorationLine: 'underline',
    },
    completedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    completedText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    quickMarkBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    quickMarkText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });

export type PersonalTrackBannerStyles = ReturnType<typeof createPersonalTrackBannerStyles>;
