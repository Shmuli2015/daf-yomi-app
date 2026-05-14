import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

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
}

const HomeContent = React.memo(function HomeContent({
  streak,
  last7Days,
}: HomeContentProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const showBars = useSharedValue(0);

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
              const isToday = index === 6; // last item is today
              const isLearned = day.status === 'learned';
              let barHeight = 12;
              let barColor: string = theme.colors.progressTrack;
              let opacity = 0.5;
              
              if (isLearned) {
                barHeight = 60;
                barColor = theme.colors.accent;
                opacity = 1;
              } else if (isToday) {
                barHeight = 24;
                barColor = theme.colors.accent;
                opacity = 0.3;
              }

              const animatedStyle = useAnimatedStyle(() => ({
                height: showBars.value * barHeight,
              }));

              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barBg}>
                    <Animated.View 
                      style={[
                        styles.barFill, 
                        animatedStyle,
                        { 
                          backgroundColor: barColor,
                          opacity: opacity,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                    {day.dayNameHe}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
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
      ...theme.shadow.cardMedium,
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

