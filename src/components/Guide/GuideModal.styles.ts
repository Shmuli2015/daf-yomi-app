import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createGuideModalStyles(theme: Theme) {
  return StyleSheet.create({
    overlayRoot: {
      flex: 1,
    },
    overlayDim: {
      backgroundColor: theme.colors.overlayStrong,
    },
    sheetLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sheetFill: {
      flex: 1,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
    },
    modalSafe: {
      flex: 1,
      backgroundColor: theme.colors.background,
      direction: 'rtl',
    },
    handleSpacing: {
      paddingTop: 8,
      paddingBottom: 4,
      backgroundColor: theme.colors.surface,
    },
    stickyHeader: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 8,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 16,
    },
    searchResultsInfo: {
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    searchResultsText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    bottomSpacer: {
      height: 24,
    },
  });
}

export type GuideModalStyles = ReturnType<typeof createGuideModalStyles>;
