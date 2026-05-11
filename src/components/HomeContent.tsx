import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakTitle}>רצף לימוד</Text>
          <View style={styles.streakValueContainer}>
            <Text style={styles.streakValue}>{streak}</Text>
            <Text style={styles.streakLabel}>ימים ברצף</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          {[...last7Days].map((day, index) => {
            const isToday = index === 0;
            const isLearned = day.status === 'learned';
            let barHeight = 16;
            let barColor: string = theme.colors.textMuted;
            let opacity = 0.3;
            
            if (isLearned) {
              barHeight = 70;
              barColor = theme.colors.accent;
              opacity = 1;
            } else if (isToday) {
              barHeight = 40;
              barColor = theme.colors.accent;
              opacity = 0.5;
            }

            return (
              <View key={index} style={styles.barColumn}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight, 
                      backgroundColor: barColor,
                      opacity: opacity,
                    }
                  ]} 
                />
                <Text style={[styles.dayLabel, isToday && { color: theme.colors.accent, fontWeight: '800' }]}>
                  {day.dayNameHe}
                </Text>
              </View>
            );
          })}
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
      gap: 16,
    },
    streakCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.15)',
      ...theme.shadow.cardMedium,
    },
    streakHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    streakTitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    streakValueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    streakValue: {
      color: theme.colors.accent,
      fontSize: 40,
      fontWeight: '900',
      textShadowColor: 'rgba(201,150,60,0.3)',
      textShadowOffset: { width: 0, height: 4 },
      textShadowRadius: 10,
    },
    streakLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    chartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 120,
      paddingHorizontal: 4,
    },
    barColumn: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
    bar: {
      width: 14,
      borderRadius: 7,
    },
    dayLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
  });
