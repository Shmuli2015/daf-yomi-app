import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const createYesterdayNudgeStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginBottom: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    body: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    markBtn: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    markBtnText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '800',
    },
  });
