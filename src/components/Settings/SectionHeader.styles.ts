import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export function createSectionHeaderStyles(theme: Theme, isFirst?: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 24,
      marginTop: isFirst ? 8 : 22,
      marginBottom: 10,
    },
    iconBox: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    accentBar: {
      width: 4,
      height: 18,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
  });
}

export type SectionHeaderStyles = ReturnType<typeof createSectionHeaderStyles>;
