import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createHomeDateBarStyles } from './HomeDateBar.styles';

interface HomeDateBarProps {
  hebrewDateStr: string;
  gregorianDateStr: string;
  eventName?: string;
  showSecularDate?: boolean;
  isToday?: boolean;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onTodayPress?: () => void;
  animatedTodayBtnStyle?: any;
}

const HomeDateBar = React.memo(function HomeDateBar({
  hebrewDateStr,
  gregorianDateStr,
  eventName,
  showSecularDate = true,
  isToday = true,
  onPrevDay,
  onNextDay,
  onTodayPress,
  animatedTodayBtnStyle,
}: HomeDateBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeDateBarStyles(theme), [theme]);
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onPrevDay}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="יום קודם"
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datesContainer}
          onPress={onTodayPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isToday ? 'התאריך של היום' : 'חזור להיום'}
        >
          <Text style={styles.hebrewDate}>{cleanHebrewDate}</Text>
          {showSecularDate && <Text style={styles.gregorianDate}>{gregorianDateStr}</Text>}
          {eventName ? <Text style={styles.eventName}>{eventName}</Text> : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={onNextDay}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="יום הבא"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {!isToday && (
        <Animated.View style={[styles.todayButtonWrapper, animatedTodayBtnStyle]}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={onTodayPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="חזור להיום"
          >
            <Ionicons name="calendar-outline" size={14} color={theme.colors.accent} />
            <Text style={styles.todayButtonText}>חזור להיום</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
});

export default HomeDateBar;
