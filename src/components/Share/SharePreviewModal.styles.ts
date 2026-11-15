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
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.full,
      padding: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
      position: 'relative',
      direction: 'ltr',
      width: 280,
    },
    indicator: {
      position: 'absolute',
      top: 3,
      bottom: 3,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card,
    },
    segmentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 7,
      borderRadius: theme.radius.full,
      zIndex: 1,
    },
    segmentBtnActiveFallback: {
      backgroundColor: theme.colors.surface,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    segmentTextActive: {
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
