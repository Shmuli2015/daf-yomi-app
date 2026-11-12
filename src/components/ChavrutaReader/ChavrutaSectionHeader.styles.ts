import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';
import type { ReaderThemePalette } from '../../utils/readerTheme';

export function createChavrutaSectionHeaderStyles(
  theme: Theme,
  palette: Pick<
    ReaderThemePalette,
    'accentLight' | 'accentBorder' | 'accentColor' | 'borderColor'
  >,
) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 12,
      paddingHorizontal: 8,
      gap: 12,
      width: '100%',
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: palette.borderColor,
    },
    badge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: palette.accentLight,
      borderWidth: 1,
      borderColor: palette.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
      color: palette.accentColor,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
  });
}
