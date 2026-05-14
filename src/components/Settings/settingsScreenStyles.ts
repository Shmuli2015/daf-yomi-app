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
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    privacyNote: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 24,
      marginHorizontal: 40,
      lineHeight: 18,
      opacity: 0.8,
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
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    loaderCard: {
      backgroundColor: theme.colors.surface,
      padding: 30,
      borderRadius: 24,
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
      minWidth: 180,
    },
    loaderText: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
  });
}

export type SettingsScreenStyles = ReturnType<typeof createSettingsScreenStyles>;
