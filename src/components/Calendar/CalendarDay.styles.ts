import { Platform, StyleSheet } from 'react-native';
import { Theme } from '../../theme';

const visualRightEdge = Platform.OS === 'web' ? { right: 0 } : { left: 0 };
const visualLeftEdge = Platform.OS === 'web' ? { left: 0 } : { right: 0 };

export const createCalendarDayStyles = (theme: Theme) =>
  StyleSheet.create({
    cell: {
      width: '14.28%',
      paddingHorizontal: 2,
      paddingVertical: 2.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCard: {
      width: '100%',
      height: 55,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      paddingBottom: 4,
      paddingHorizontal: 2,
      overflow: 'hidden',
      position: 'relative',
    },
    partialFill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      backgroundColor: theme.colors.accent,
      opacity: 0.28,
    },
    partialFillRight: {
      ...visualRightEdge,
    },
    partialFillLeft: {
      ...visualLeftEdge,
    },
    pulseRing: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.accent,
      backgroundColor: 'transparent',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 3.5,
      height: 10,
    },
    topPlaceholder: {
      width: 6,
      height: 6,
    },
    dayText: {
      fontSize: 13.5,
      fontWeight: '800',
      textAlign: 'center',
      includeFontPadding: false,
    },
    gregText: {
      fontSize: 8,
      fontWeight: '600',
      includeFontPadding: false,
    },
    specialDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.accent,
    },
    dafChip: {
      width: '92%',
      paddingVertical: 1.5,
      paddingHorizontal: 2,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dafChipText: {
      width: '100%',
      fontSize: 8.5,
      fontWeight: '700',
      textAlign: 'center',
      includeFontPadding: false,
    },
    dafPlaceholder: {
      height: 14,
    },
  });
