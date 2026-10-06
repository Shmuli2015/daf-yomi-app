import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export function createHomeScreenStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenOuter: {
      flex: 1,
      position: 'relative',
      backgroundColor: theme.colors.background,
    },
    loading: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    scroll: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingTop: 20, paddingBottom: 24 },
  });
}
