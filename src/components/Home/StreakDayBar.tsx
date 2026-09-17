import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { HomeStreakCardStyles } from './HomeStreakCard.styles';

interface StreakDayBarProps {
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

const StreakDayBar = React.memo(function StreakDayBar({
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
  const showBarOutline = isSelected && !isLearned;

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
      <View
        style={[
          styles.barBg,
          isLearned && styles.learnedBarBg,
          showBarOutline && styles.selectedBarOutline,
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              height: barHeight,
              backgroundColor: barColor,
              opacity: barOpacity,
            },
          ]}
        />
      </View>
      <View style={styles.dayLabelWrapper}>
        <Text
          style={[
            styles.dayLabel,
            isToday && styles.todayLabel,
            isSelected && styles.selectedLabel,
          ]}
        >
          {dayNameHe}
        </Text>
        {isSelected ? (
          <View style={styles.selectedDot} />
        ) : (
          <View style={styles.selectedDotEmpty} />
        )}
      </View>
    </TouchableOpacity>
  );
});

export default StreakDayBar;
