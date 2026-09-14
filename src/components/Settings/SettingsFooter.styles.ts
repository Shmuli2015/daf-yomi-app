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
      borderRadius: 24,
      paddingVertical: 22,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.cardMedium,
      position: 'relative',
      overflow: 'hidden',
    },
    cardGradient: {
      ...StyleSheet.absoluteFill,
      borderRadius: 24,
    },
    iconHalo: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.accentBorder,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    tagline: {
      color: theme.colors.textSecondary,
      fontSize: 12.5,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 3,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '65%',
      marginVertical: 14,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
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
    dotSeparator: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.colors.textMuted,
      opacity: 0.6,
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
