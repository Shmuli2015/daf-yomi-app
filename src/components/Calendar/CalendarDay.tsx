import React, { useEffect, useRef, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { HDate } from '@hebcal/core';
import { useTheme } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { createCalendarDayStyles } from './CalendarDay.styles';

interface CalendarDayProps {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  partial?: boolean;
  isToday: boolean;
  isSelected: boolean;
  dafLabel?: string;
  hasSpecialEvent?: boolean;
  onPress: (hdate: HDate) => void;
}

const CalendarDay = React.memo(
  ({ hdate, isCurrentMonth, learned, partial = false, isToday, isSelected, dafLabel, hasSpecialEvent, onPress }: CalendarDayProps) => {
    const theme = useTheme();
    const styles = useMemo(() => createCalendarDayStyles(theme), [theme]);
    const showSecularDate = useAppStore((s) => s.settings?.show_secular_date === 1);

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

    const containerOpacity = isCurrentMonth
      ? 1
      : learned || partial
        ? 0.75
        : 0.35;

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: containerOpacity,
    }));

    const animatedPulseStyle = useAnimatedStyle(() => ({
      opacity: pulseOpacity.value,
    }));

    const isSpecial = hasSpecialEvent && !learned && isCurrentMonth;

    const bg = learned
      ? theme.colors.accent
      : isToday
        ? theme.colors.accentLight
        : 'transparent';

    const textColor = learned
      ? theme.colors.white
      : isToday
        ? theme.colors.accent
        : theme.colors.textPrimary;

    const subColor = learned
      ? theme.colors.white
      : isToday
        ? theme.colors.accent
        : theme.colors.textMuted;

    const borderColor = isSelected
      ? theme.colors.accent
      : partial
        ? theme.colors.accent
        : isSpecial
          ? theme.colors.accentBorder
          : 'transparent';

    const borderWidth = isSelected ? 1.5 : partial ? 1.5 : isSpecial ? 1 : 0;

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.cell}>
        <Animated.View style={animatedContainerStyle}>
          {isToday && (
            <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
          )}
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: bg,
                borderColor,
                borderWidth,
              },
            ]}
          >
            {partial && !learned && (
              <View style={styles.halfFill} />
            )}
            <Animated.Text style={[styles.dayText, { color: textColor }]}>{gematriya}</Animated.Text>
            {showSecularDate && (
              <Animated.Text style={[styles.gregText, { color: subColor }]}>{gregDay}</Animated.Text>
            )}
            {dafLabel ? (
              <Animated.Text style={[styles.dafText, { color: subColor }]}>{dafLabel}</Animated.Text>
            ) : null}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
      prevProps.learned === nextProps.learned &&
      prevProps.partial === nextProps.partial &&
      prevProps.isToday === nextProps.isToday &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.dafLabel === nextProps.dafLabel &&
      prevProps.hasSpecialEvent === nextProps.hasSpecialEvent &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.hdate.getFullYear() === nextProps.hdate.getFullYear() &&
      prevProps.hdate.getMonth() === nextProps.hdate.getMonth() &&
      prevProps.hdate.getDate() === nextProps.hdate.getDate()
    );
  }
);

export default CalendarDay;

