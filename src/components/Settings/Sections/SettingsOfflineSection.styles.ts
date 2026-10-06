import { StyleSheet, Platform } from 'react-native';
import { Theme } from '../../../theme';

export function createSettingsOfflineSectionStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';
  return StyleSheet.create({
    progressWrap: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 18,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: theme.colors.surface,
      direction: 'rtl',
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      direction: 'rtl',
    },
    progressMessage: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    stopText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.danger,
      writingDirection: 'rtl',
    },
    progressTrack: {
      height: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.progressTrack,
      overflow: 'hidden',
      width: '100%',
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.accent,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
  });
}
