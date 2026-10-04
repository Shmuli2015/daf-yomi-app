import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideContactCardStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginTop: 8,
      marginBottom: 10,
      direction: 'rtl',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
      ...theme.shadow.card,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.primary,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    sendBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.accent,
      borderRadius: 10,
      paddingVertical: 9,
    },
    sendBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.white,
      writingDirection: 'rtl',
    },
    copyBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.accentLight,
      borderRadius: 10,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    copyBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.accent,
      writingDirection: 'rtl',
    },
    wishBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      marginTop: 4,
    },
    wishText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.textMuted,
      writingDirection: 'rtl',
    },
  });
}
