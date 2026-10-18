import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';
import type { ReaderThemePalette } from '../../utils/readerTheme';

export function createChavrutaUnavailableStateStyles(theme: Theme, palette: ReaderThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 24,
      gap: 14,
      direction: 'rtl',
      backgroundColor: palette.backgroundColor,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.surfaceColor,
      borderWidth: 1,
      borderColor: palette.borderColor,
    },
    title: {
      fontSize: 19,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      color: palette.textColor,
    },
    divider: {
      width: 40,
      height: 3,
      borderRadius: theme.radius.sm,
      backgroundColor: palette.accentColor,
      opacity: 0.6,
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      color: palette.subTextColor,
    },
  });
}
