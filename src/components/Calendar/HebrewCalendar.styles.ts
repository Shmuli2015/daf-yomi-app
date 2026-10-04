import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

export const createHebrewCalendarStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
      ...theme.shadow.card,
    },
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    navControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    navBtn: {
      width: 32,
      height: 32,
      borderRadius: 9,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    monthPickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 11,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    monthPickerText: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      letterSpacing: -0.2,
      includeFontPadding: false,
    },
    weekLabels: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 4,
    },
    weekLabelWrapper: {
      width: '14.28%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 3,
    },
    weekLabel: {
      fontSize: 11.5,
      fontWeight: '800',
      color: theme.colors.textMuted,
      textAlign: 'center',
      includeFontPadding: false,
    },
    weekLabelShabbat: {
      color: theme.colors.accent,
    },
    grid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      direction: 'ltr',
    },
  });
