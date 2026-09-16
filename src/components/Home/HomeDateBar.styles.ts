import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createHomeDateBarStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      flex: 1,
      paddingHorizontal: 8,
    },
    hebrewDate: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    gregorianDate: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    eventName: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 4,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    todayButtonWrapper: {
      marginTop: 10,
      alignItems: 'center',
    },
    todayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    todayButtonText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
  });

export type HomeDateBarStyles = ReturnType<typeof createHomeDateBarStyles>;
