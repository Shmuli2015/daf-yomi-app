import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { HomeStreakCardStyles } from './HomeStreakCard.styles';

interface StreakDayBarProps {
  showBars?: SharedValue<number>;
  barHeight: number;
  barColor: string;
  barOpacity: number;
  dayNameHe: string;
  isToday: boolean;
  isSelected: boolean;
  isLearned?: boolean;
  onPress: () => void;
  styles: HomeStreakCardStyles;
}

export default function StreakDayBar({
  barHeight,
  barColor,
  barOpacity,
  dayNameHe,
  isToday,
  isSelected,
  isLearned = false,
  onPress,
  styles,
}: StreakDayBarProps) {
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withTiming(barHeight, {
      duration: 400,
      easing: Easing.out(Easing.exp),
    });
  }, [barHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <TouchableOpacity
      style={styles.barColumn}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`יום ${dayNameHe}`}
    >
      <View style={styles.barIndicatorWrapper}>
        {isLearned ? (
          <Ionicons name="checkmark" size={11} color={barColor} />
        ) : (
          <View style={styles.barEmptyIndicator} />
        )}
      </View>
      <View style={[styles.barBg, isSelected && styles.selectedBarBg]}>
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
      <Text
        style={[
          styles.dayLabel,
          isToday && styles.todayLabel,
          isSelected && !isToday && styles.selectedLabel,
        ]}
      >
        {dayNameHe}
      </Text>
    </TouchableOpacity>
  );
}
