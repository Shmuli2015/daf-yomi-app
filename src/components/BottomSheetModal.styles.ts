import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createBottomSheetModalStyles(theme: Theme) {
  return StyleSheet.create({
    overlayRoot: {
      flex: 1,
    },
    overlayDim: {
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    sheetLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 20,
    },
  });
}
