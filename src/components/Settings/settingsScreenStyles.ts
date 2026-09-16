import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createSettingsScreenStyles(theme: Theme) {
  return StyleSheet.create({
    screenOuter: { flex: 1, position: 'relative' },
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    screenRoot: { flex: 1, position: 'relative' },
    scroll: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingTop: 24, paddingBottom: 12 },
    body: {},
    pageHeader: {
      paddingHorizontal: 20,
      marginBottom: 20,
      alignItems: 'flex-start',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 4,
    },
    accentBar: {
      width: 4,
      height: 32,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    loadingRoot: {
      flex: 1,
      position: 'relative',
    },
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    privacyNote: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 20,
      marginHorizontal: 40,
      lineHeight: 18,
      opacity: 0.85,
    },
    backupHint: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 10,
      marginHorizontal: 28,
      lineHeight: 18,
    },
    noResultsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
      gap: 10,
    },
    noResultsIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    noResultsTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    noResultsText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    clearSearchBtn: {
      marginTop: 8,
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    clearSearchBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

export type SettingsScreenStyles = ReturnType<typeof createSettingsScreenStyles>;
