import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import ShareIconButton from '../Share/ShareIconButton';
import StreakDayBar from './StreakDayBar';
import { createHomeStreakCardStyles } from './HomeStreakCard.styles';
import type { Last7DayRecord } from '../../utils/last7Days';

interface HomeStreakCardProps {
  streak: number;
  last7Days: Last7DayRecord[];
  viewedDateStr: string;
  onSharePress: () => void;
  onSelectDay: (date: Date) => void;
}

const HomeStreakCard = React.memo(function HomeStreakCard({
  streak,
  last7Days,
  viewedDateStr,
  onSharePress,
  onSelectDay,
}: HomeStreakCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStreakCardStyles(theme), [theme]);

  return (
    <View style={styles.streakCard}>
      <LinearGradient
        colors={[theme.colors.accent + '0D', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.streakHeader}>
        <View style={styles.streakInfo}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="flame" size={24} color={theme.colors.accent} />
          </View>
          <View>
            <Text style={styles.streakTitle}>
              {streak > 0 ? 'רצף לימוד נוכחי' : 'התחל רצף היום'}
            </Text>
            <View style={styles.streakValueRow}>
              <Text style={styles.streakValue}>{streak}</Text>
              <Text style={styles.streakLabel}>ימים</Text>
            </View>
          </View>
        </View>
        <ShareIconButton onPress={onSharePress} />
      </View>

      <View style={styles.divider} />

      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>7 הימים האחרונים</Text>
        <View style={styles.chartContainer}>
          {last7Days.map((day) => {
            const isToday = day.isToday;
            const isSelected = day.dateStr === viewedDateStr;
            const isLearned = day.status === 'learned';
            const isPartial = day.status === 'partial';
            let barHeight = 12;
            let barColor: string = theme.colors.progressTrack;
            let barOpacity = 0.5;

            if (isLearned) {
              barHeight = 56;
              barColor = theme.colors.accent;
              barOpacity = 1;
            } else if (isPartial) {
              barHeight = 34;
              barColor = theme.colors.accent;
              barOpacity = 0.65;
            } else if (isToday) {
              barHeight = 22;
              barColor = theme.colors.accent;
              barOpacity = 0.3;
            }

            return (
              <StreakDayBar
                key={day.dateStr}
                barHeight={barHeight}
                barColor={barColor}
                barOpacity={barOpacity}
                dayNameHe={day.dayNameHe}
                isToday={isToday}
                isSelected={isSelected}
                isLearned={isLearned}
                onPress={() => onSelectDay(day.date)}
                styles={styles}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
});

export default HomeStreakCard;
