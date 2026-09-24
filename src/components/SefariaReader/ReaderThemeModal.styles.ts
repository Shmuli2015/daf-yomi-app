import { Platform, StyleSheet } from 'react-native';
import { LIGHT_THEME, type Theme } from '../../theme';

export function createReaderThemeModalStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';
  const onAccent = LIGHT_THEME.colors.surface;

  return StyleSheet.create({
    container: {
      direction: 'rtl',
      paddingHorizontal: 4,
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    closeBtn: {
      padding: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.accentLight,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: textAlignment,
      writingDirection: 'rtl',
      marginTop: -4,
    },
    optionsList: {
      gap: 10,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      gap: 12,
    },
    optionCardActive: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight,
    },
    previewSwatch: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
    },
    previewText: {
      fontSize: 11,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    optionInfo: {
      flex: 1,
      gap: 3,
    },
    optionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    optionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    optionDesc: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    checkCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkCircleActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    checkIconColor: {
      color: onAccent,
    },
  });
}
