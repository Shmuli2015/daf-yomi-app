import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import ShareIconButton from './Share/ShareIconButton';
import SharePreviewModal from './Share/SharePreviewModal';
import StreakDayBar from './Home/StreakDayBar';
import { createHomeContentStyles } from './Home/HomeContent.styles';
import type { StreakShareData } from '../utils/shareProgressImage';

interface DayRecord {
  date: Date;
  dateStr: string;
  status: string;
  dayName: string;
  dayNameHe: string;
}

interface HomeContentProps {
  streak: number;
  last7Days: DayRecord[];
  hebrewDateStr: string;
}

const HomeContent = React.memo(function HomeContent({
  streak,
  last7Days,
  hebrewDateStr,
}: HomeContentProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeContentStyles(theme), [theme]);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareData, setShareData] = useState<StreakShareData | null>(null);

  const showBars = useSharedValue(0);

  const handleSharePress = useCallback(() => {
    const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');
    setShareData({ variant: 'streak', streak, hebrewDate: cleanHebrewDate });
    setShareVisible(true);
  }, [hebrewDateStr, streak]);

  const handleShareClose = useCallback(() => {
    setShareVisible(false);
  }, []);

  useEffect(() => {
    showBars.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) }));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.streakCard}>
        <LinearGradient
          colors={[theme.colors.accent + '10', 'transparent']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.shareButtonRow} pointerEvents="box-none">
          <ShareIconButton onPress={handleSharePress} />
        </View>

        <View style={styles.streakInfo}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="flame" size={24} color={theme.colors.accent} />
          </View>
          <View>
            <Text style={styles.streakTitle}>רצף לימוד נוכחי</Text>
            <View style={styles.streakValueRow}>
              <Text style={styles.streakValue}>{streak}</Text>
              <Text style={styles.streakLabel}>ימים</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.chartWrapper}>
          <Text style={styles.chartTitle}>7 הימים האחרונים</Text>
          <View style={styles.chartContainer}>
            {[...last7Days].map((day, index) => {
              const isToday = index === 6;
              const isLearned = day.status === 'learned';
              const isPartial = day.status === 'partial';
              let barHeight = 12;
              let barColor: string = theme.colors.progressTrack;
              let barOpacity = 0.5;

              if (isLearned) {
                barHeight = 60;
                barColor = theme.colors.accent;
                barOpacity = 1;
              } else if (isPartial) {
                barHeight = 36;
                barColor = theme.colors.accent;
                barOpacity = 0.65;
              } else if (isToday) {
                barHeight = 24;
                barColor = theme.colors.accent;
                barOpacity = 0.3;
              }

              return (
                <StreakDayBar
                  key={day.dateStr}
                  showBars={showBars}
                  barHeight={barHeight}
                  barColor={barColor}
                  barOpacity={barOpacity}
                  dayNameHe={day.dayNameHe}
                  isToday={isToday}
                  styles={styles}
                />
              );
            })}
          </View>
        </View>
      </View>

      <SharePreviewModal visible={shareVisible} onClose={handleShareClose} data={shareData} />
    </View>
  );
});

export default HomeContent;
