import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import ShareIconButton from './Share/ShareIconButton';
import SharePreviewModal from './Share/SharePreviewModal';
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

type HomeStyles = ReturnType<typeof createStyles>;

function StreakDayBar({
  showBars,
  barHeight,
  barColor,
  barOpacity,
  dayNameHe,
  isToday,
  styles,
}: {
  showBars: SharedValue<number>;
  barHeight: number;
  barColor: string;
  barOpacity: number;
  dayNameHe: string;
  isToday: boolean;
  styles: HomeStyles;
}) {
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

const HomeContent = React.memo(function HomeContent({
  streak,
  last7Days,
  hebrewDateStr,
}: HomeContentProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    <Animated.View entering={FadeInDown.duration(400).delay(300).springify()} style={[styles.container]}>
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
    </Animated.View>
  );
});

export default HomeContent;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    streakCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      position: 'relative',
      ...theme.shadow.cardMedium,
    },
    shareButtonRow: {
      position: 'absolute',
      top: 16,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingEnd: 24,
      zIndex: 1,
    },
    streakInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    streakIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 20,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    streakTitle: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    streakValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    streakValue: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
    },
    streakLabel: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 24,
    },
    chartWrapper: {
      gap: 16,
    },
    chartTitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 100,
    },
    barColumn: {
      alignItems: 'center',
      gap: 8,
    },
    barBg: {
      width: 12,
      height: 60,
      backgroundColor: theme.colors.progressTrack + '40',
      borderRadius: 6,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      borderRadius: 6,
    },
    dayLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    todayLabel: {
      color: theme.colors.accent,
    },
  });

