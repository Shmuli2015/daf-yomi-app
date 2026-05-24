import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export function createViewerStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    viewer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    webview: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    zoomHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    zoomHintText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: theme.colors.background,
    },
    hint: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    errorTitle: {
      marginTop: 16,
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center',
    },
    errorBody: {
      marginTop: 8,
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 22,
    },
    actions: {
      marginTop: 24,
      gap: 10,
      width: '100%',
      maxWidth: 280,
    },
    primaryBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    secondaryBtnText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    contentLoader: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      backgroundColor: theme.colors.background,
    },
  });
}

export type ViewerStyles = ReturnType<typeof createViewerStyles>;
