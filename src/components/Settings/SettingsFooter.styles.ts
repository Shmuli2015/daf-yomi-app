import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createSettingsFooterStyles(theme: Theme) {
  return StyleSheet.create({
    footerContainer: {
      marginTop: 28,
      marginBottom: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    card: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
      position: 'relative',
      overflow: 'hidden',
    },
    cardGradient: {
      ...StyleSheet.absoluteFill,
      borderRadius: theme.radius.lg,
    },
    iconHalo: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      borderWidth: 1.5,
      borderColor: theme.colors.accentBorder,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    tagline: {
      color: theme.colors.textMuted,
      fontSize: 12.5,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 4,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '55%',
      marginTop: 16,
      marginBottom: 16,
      gap: 8,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.accent,
    },
    metaStack: {
      alignItems: 'center',
      gap: 10,
    },
    authorBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    authorText: {
      color: theme.colors.textSecondary,
      fontSize: 12.5,
      fontWeight: '600',
    },
    versionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 3.5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    versionDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.colors.accent,
    },
    versionText: {
      color: theme.colors.textPrimary,
      fontSize: 11.5,
      fontWeight: '700',
    },
  });
}
