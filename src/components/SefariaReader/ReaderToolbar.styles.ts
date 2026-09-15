import { StyleSheet } from 'react-native';
import { LIGHT_THEME, type Theme } from '../../theme';

export function createReaderToolbarStyles(theme: Theme) {
  const onAccent = LIGHT_THEME.colors.surface;

  return StyleSheet.create({
    container: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 8,
    },
    modeSwitcher: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      width: '100%',
      backgroundColor: theme.colors.accentLight,
      borderRadius: theme.radius.sm,
      padding: 3,
      overflow: 'hidden',
    },
    modeIndicator: {
      position: 'absolute',
      top: 3,
      bottom: 3,
      borderRadius: 8,
    },
    modeButton: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      paddingVertical: 7,
      borderRadius: 8,
      gap: 4,
      zIndex: 1,
    },
    modeText: {
      fontSize: 12,
      fontWeight: '700',
      flexShrink: 1,
    },
    modeTextActive: {
      color: onAccent,
    },
    modeTextInactive: {
      color: theme.colors.textMuted,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      width: '100%',
      direction: 'rtl',
    },
    fontControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.accentLight,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 4,
      paddingVertical: 3,
      direction: 'ltr',
    },
    fontBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    fontBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    fontSizeLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
      paddingHorizontal: 6,
      minWidth: 22,
      textAlign: 'center',
    },
    notesBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.accentLight,
    },
    notesBtnActive: {
      backgroundColor: theme.colors.accent,
    },
    notesBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    notesBtnTextActive: {
      color: onAccent,
    },
    btnDisabled: {
      opacity: 0.3,
    },
    controlsSpacer: {
      flex: 1,
    },
  });
}
