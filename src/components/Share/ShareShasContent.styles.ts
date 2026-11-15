import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export const SHAS_RING_SIZE = 340;
export const SHAS_RING_RADIUS = 138;
export const SHAS_STROKE_WIDTH = 26;
export const SHAS_CIRCUMFERENCE = 2 * Math.PI * SHAS_RING_RADIUS;

export function createShareShasContentStyles(theme: Theme, isDark: boolean) {
  const textColor = isDark ? theme.colors.textPrimary : theme.colors.primary;
  const mutedColor = isDark ? theme.colors.textSecondary : theme.colors.textMuted;
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const quoteBg = isDark ? 'rgba(201,150,60,0.09)' : 'rgba(201,150,60,0.08)';

  return StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    milestonePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 28,
      borderRadius: theme.radius.full,
      backgroundColor: cardBg,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
      marginBottom: 20,
    },
    milestoneText: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    ringContainer: {
      width: SHAS_RING_SIZE,
      height: SHAS_RING_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: 24,
    },
    ringCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringPercent: {
      fontSize: 78,
      fontWeight: '900',
      color: textColor,
      letterSpacing: -2,
    },
    ringLabel: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.accent,
      letterSpacing: 0.5,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 20,
      width: '100%',
      marginBottom: 22,
    },
    statCard: {
      flex: 1,
      maxWidth: 380,
      borderRadius: theme.radius.lg,
      paddingVertical: 24,
      paddingHorizontal: 24,
      alignItems: 'center',
      backgroundColor: cardBg,
      borderWidth: 1.5,
      borderColor: theme.colors.cardFrameBorder,
    },
    statIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(201,150,60,0.15)' : 'rgba(201,150,60,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    statValue: {
      fontSize: 48,
      fontWeight: '900',
      color: textColor,
      letterSpacing: -1,
    },
    statTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.accent,
      marginTop: 4,
      textAlign: 'center',
    },
    statSubtext: {
      fontSize: 18,
      fontWeight: '600',
      color: mutedColor,
      marginTop: 2,
      textAlign: 'center',
    },
    quoteContainer: {
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: theme.radius.md,
      backgroundColor: quoteBg,
      borderWidth: 1,
      borderColor: theme.colors.cardFrameBorderGlow,
      maxWidth: 720,
      alignSelf: 'center',
    },
    quoteText: {
      fontSize: 21,
      fontWeight: '700',
      color: theme.colors.accent,
      textAlign: 'center',
      letterSpacing: 0.5,
      writingDirection: 'rtl',
    },
  });
}
