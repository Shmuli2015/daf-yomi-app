import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const createHomeHeaderStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outerContainer: {
      position: 'relative',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    navBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    datesContainer: {
      alignItems: 'center',
    },
    hebrewDate: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    gregorianDate: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    dafCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.hero,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    guideIconBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(201, 150, 60, 0.3)',
    },
    guideIconText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
    dailyStudyBadge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
    },
    dailyStudyText: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dafBadgeSmall: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dafBadgeText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
    },
    masechetPressable: {
      marginBottom: 24,
    },
    masechetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    masechetContent: {
      flex: 1,
    },
    masechetChevron: {
      paddingStart: 4,
    },
    masechetName: {
      fontSize: 40,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: 'left',
      letterSpacing: -1,
      lineHeight: 48,
    },
    masechetSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    dafBadgeTextMain: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    masechetBrowseHint: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    progressSection: {
      marginBottom: 24,
      backgroundColor: theme.colors.background,
      padding: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressTitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    progressValue: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: '800',
    },
    progressBarBg: {
      height: 8,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 4,
    },
    actionsContainer: {
      gap: 12,
    },
    halfDafTip: {
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: 'rgba(201, 150, 60, 0.35)',
    },
    halfDafTipInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    halfDafTipText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textAlign: 'right',
    },
    halfDafTipBold: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
    halfDafTipDismiss: {
      padding: 4,
    },
    mainButton: {
      height: 58,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    mainButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    buttonPending: {
      backgroundColor: theme.colors.accent,
    },
    buttonDone: {
      backgroundColor: theme.colors.success + '15',
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    buttonPartial: {
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accent + '60',
    },
    mainButtonText: {
      fontSize: 15,
      fontWeight: '800',
    },
    buttonTextPending: {
      color: '#FFFFFF',
    },
    buttonTextDone: {
      color: theme.colors.success,
    },
    buttonTextPartial: {
      color: theme.colors.accent,
    },
    secondaryButton: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    tzuratButton: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.accent + '40',
      backgroundColor: theme.colors.accentLight,
    },
    tzuratButtonText: {
      color: theme.colors.accent,
      fontSize: 15,
      fontWeight: '800',
    },
    todayButton: {
      alignSelf: 'center',
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: -10,
      marginBottom: 10,
    },
    todayButtonText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
  });

export type HomeHeaderStyles = ReturnType<typeof createHomeHeaderStyles>;
