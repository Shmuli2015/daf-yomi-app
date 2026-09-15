import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

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
    halfFill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: '50%',
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
    gregText: {
      fontSize: 8.5,
      fontWeight: '600',
      lineHeight: 10,
      marginTop: 1,
      textAlign: 'center',
    },
    dafText: {
      fontSize: 7.5,
      fontWeight: '700',
      lineHeight: 9,
      marginTop: 1,
      textAlign: 'center',
    },
  });
