import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function createChapterBoundaryMarkerStyles(
  theme: Theme,
  palette: Pick<ReaderThemePalette, 'accentLight' | 'accentBorder' | 'accentColor' | 'textColor'>,
) {
  return StyleSheet.create({
    container: {
      alignSelf: 'stretch',
      width: '100%',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.accentBorder,
      backgroundColor: palette.accentLight,
      borderRadius: theme.radius.sm,
    },
    heading: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: palette.accentColor,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      writingDirection: 'rtl',
      color: palette.textColor,
    },
  });
}
