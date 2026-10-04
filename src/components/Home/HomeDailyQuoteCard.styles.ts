import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeDailyQuoteCardStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadow.cardMedium,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.accent,
      letterSpacing: 0.2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    badge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.accent,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quoteBody: {
      width: '100%',
      alignSelf: 'stretch',
    },
    quoteText: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
      alignSelf: 'stretch',
    },
    footer: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sourceText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.accent,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    copiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    copiedText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.success,
    },
  });

export type HomeDailyQuoteCardStyles = ReturnType<typeof createHomeDailyQuoteCardStyles>;
