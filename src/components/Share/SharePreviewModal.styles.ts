import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';
import { CARD_SIZE } from '../../utils/shareProgressImage';

export const PREVIEW_SIZE = 310;
export const PREVIEW_SCALE = PREVIEW_SIZE / CARD_SIZE;

export function createSharePreviewModalStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingTop: 12,
      direction: 'rtl',
    },
    closeBtn: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: 4,
      zIndex: 2,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 16,
      textAlign: 'center',
    },
    themeSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 16,
      backgroundColor: theme.colors.background,
      padding: 4,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    themeOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: theme.radius.full,
    },
    themeOptionButtonActive: {
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card,
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    themeOptionTextActive: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
    previewWrapper: {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      overflow: 'hidden',
      borderRadius: theme.radius.lg,
      marginBottom: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      ...theme.shadow.cardMedium,
    },
    previewScaler: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      transform: [{ scale: PREVIEW_SCALE }],
    },
    shareButton: {
      width: '100%',
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      ...theme.shadow.gold,
    },
    shareButtonDisabled: {
      opacity: 0.85,
    },
    shareText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '800',
    },
    captureHost: {
      position: 'absolute',
      left: -10000,
      top: 0,
      width: CARD_SIZE,
      height: CARD_SIZE,
      opacity: 1,
    },
  });
}
