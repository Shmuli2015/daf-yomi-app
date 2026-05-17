import React, { useEffect, useRef, useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { HDate } from '@hebcal/core';
import { useTheme } from '../../theme';

interface CalendarDayProps {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  isToday: boolean;
  isSelected: boolean;
  onPress: (hdate: HDate) => void;
}

const CalendarDay = React.memo(
  ({ hdate, isCurrentMonth, learned, isToday, isSelected, onPress }: CalendarDayProps) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const gematriya = hdate.renderGematriya().split(' ')[0];
    const gregDay = hdate.greg().getDate();

    const scale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);

    useEffect(() => {
      if (isToday) {
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.15, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.7, { duration: 1100, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      } else {
        pulseOpacity.value = withTiming(0, { duration: 200 });
      }
    }, [isToday]);

    const handlePress = () => {
      scale.value = withSequence(
        withSpring(0.8, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      onPress(hdate);
    };

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: isCurrentMonth ? 1 : 0.3,
    }));

    const animatedPulseStyle = useAnimatedStyle(() => ({
      opacity: pulseOpacity.value,
    }));

    const bg = learned ? theme.colors.accent : isToday ? theme.colors.accentLight : 'transparent';
    const textColor = learned ? 'white' : isToday ? theme.colors.accent : theme.colors.textPrimary;
    const subColor = learned ? 'rgba(255,255,255,0.7)' : isToday ? theme.colors.accent : theme.colors.textMuted;
    const borderColor = isSelected ? theme.colors.accent : 'transparent';

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.cell}>
        <Animated.View style={animatedContainerStyle}>
          {isToday && (
            <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
          )}
          <Animated.View
            style={[styles.circle, { backgroundColor: bg, borderColor, borderWidth: isSelected ? 1.5 : 0 }]}
          >
            <Animated.Text style={[styles.dayText, { color: textColor }]}>{gematriya}</Animated.Text>
            <Animated.Text style={[styles.gregText, { color: subColor }]}>{gregDay}</Animated.Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
      prevProps.learned === nextProps.learned &&
      prevProps.isToday === nextProps.isToday &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.hdate.getFullYear() === nextProps.hdate.getFullYear() &&
      prevProps.hdate.getMonth() === nextProps.hdate.getMonth() &&
      prevProps.hdate.getDate() === nextProps.hdate.getDate()
    );
  }
);

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    cell: {
      width: '14.28%',
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 2,
    },
    circle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
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
    dayText: { fontSize: 14, fontWeight: '800' },
    gregText: { fontSize: 9, fontWeight: '500', marginTop: -1 },
  });

export default CalendarDay;
