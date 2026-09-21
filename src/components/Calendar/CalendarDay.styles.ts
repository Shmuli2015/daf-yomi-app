import { Platform, StyleSheet } from 'react-native';
import { Theme } from '../../theme';

const visualRightEdge = Platform.OS === 'web' ? { right: 0 } : { left: 0 };
const visualLeftEdge = Platform.OS === 'web' ? { left: 0 } : { right: 0 };

export const createCalendarDayStyles = (theme: Theme) =>
  StyleSheet.create({
    cell: {
      width: '14.28%',
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 1,
    },
    circle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 2,
      overflow: 'hidden',
    },
    halfFillRight: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      ...visualRightEdge,
      backgroundColor: theme.colors.accent,
      opacity: 0.65,
    },
    halfFillLeft: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      ...visualLeftEdge,
      backgroundColor: theme.colors.accent,
      opacity: 0.65,
    },
    pulseRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: theme.colors.accent,
      backgroundColor: 'transparent',
      left: -2,
      top: -2,
      zIndex: -1,
    },
    dayText: {
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 15,
      textAlign: 'center',
    },
    dayTextWithDaf: {
      fontSize: 11.5,
      lineHeight: 14,
    },
    gregText: {
      fontSize: 8,
      fontWeight: '600',
      lineHeight: 9.5,
      marginTop: 1,
      textAlign: 'center',
    },
    dafText: {
      fontSize: 9.5,
      fontWeight: '800',
      lineHeight: 11.5,
      marginTop: 1,
      textAlign: 'center',
    },
  });
