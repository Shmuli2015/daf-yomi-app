import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const createMasechetModalStyles = (theme: Theme) =>
  StyleSheet.create({
    overlayRoot: {
      flex: 1,
    },
    overlayDim: {
      backgroundColor: theme.colors.overlay,
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
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
    },
    modalSafe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    handleSpacing: {
      paddingTop: 8,
      paddingBottom: 4,
      backgroundColor: theme.colors.surface,
    },
    modalHeaderContainer: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
      flexShrink: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    homeActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accentLight + '40',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    homeActionBtnActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    homeActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    homeActionTextActive: {
      color: theme.colors.white,
    },
    closeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtnText: {
      color: theme.colors.accent,
      fontWeight: '700',
      fontSize: 13,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    markAllBtn: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: theme.colors.accentLight,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      alignItems: 'center',
    },
    markAllBtnText: {
      color: theme.colors.accent,
      fontWeight: '700',
      fontSize: 14,
    },
    unmarkAllBtn: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    unmarkAllBtnText: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
      fontSize: 14,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 20,
    },
    dafGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dafRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    dafCell: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1.5,
    },
    dafCellDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    dafCellLearned: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accentBorder,
    },
    dafCellPersonalLearned: {
      backgroundColor: theme.colors.accent + '20',
      borderColor: theme.colors.accent,
    },
    dafCellPartial: {
      backgroundColor: theme.colors.accent + '25',
      borderColor: theme.colors.accent + '70',
    },
    dafCornerDot: {
      position: 'absolute',
      top: 3,
      left: 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.accent,
    },
    dafCornerStar: {
      position: 'absolute',
      top: 3,
      left: 3,
    },
    dafCornerAmudBadge: {
      position: 'absolute',
      top: 2,
      left: 3,
      paddingHorizontal: 3,
      paddingVertical: 1,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    dafCornerAmudBadgeText: {
      fontSize: 8,
      fontWeight: '900',
      color: theme.colors.white,
    },
    dafText: {
      fontSize: 15,
      fontWeight: '800',
    },
    dafTextDefault: {
      color: theme.colors.textSecondary,
    },
    dafTextLearned: {
      color: theme.colors.accent,
    },
    dafTextPersonalLearned: {
      color: theme.colors.accent,
    },
    dafTextPartial: {
      color: theme.colors.accent,
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      direction: 'ltr',
    },
  });
