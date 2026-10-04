import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '../../theme';
import { createCalendarGridSkeletonStyles } from './CalendarGridSkeleton.styles';

const CELL_COUNT = 42;

export default function CalendarGridSkeleton() {
  const theme = useTheme();
  const styles = useMemo(() => createCalendarGridSkeletonStyles(theme), [theme]);
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.55,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View style={[styles.grid, { opacity: opacityAnim }]}>
      {Array.from({ length: CELL_COUNT }, (_, index) => (
        <View key={index} style={styles.cell}>
          <View style={styles.dayCard} />
        </View>
      ))}
    </Animated.View>
  );
}
