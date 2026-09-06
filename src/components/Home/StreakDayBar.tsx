import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { HomeContentStyles } from './HomeContent.styles';

interface StreakDayBarProps {
  showBars: SharedValue<number>;
  barHeight: number;
  barColor: string;
  barOpacity: number;
  dayNameHe: string;
  isToday: boolean;
  styles: HomeContentStyles;
}

export default function StreakDayBar({
  showBars,
  barHeight,
  barColor,
  barOpacity,
  dayNameHe,
  isToday,
  styles,
}: StreakDayBarProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    height: showBars.value * barHeight,
  }));

  return (
    <View style={styles.barColumn}>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            animatedStyle,
            {
              backgroundColor: barColor,
              opacity: barOpacity,
            },
          ]}
        />
      </View>
      <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{dayNameHe}</Text>
    </View>
  );
}
