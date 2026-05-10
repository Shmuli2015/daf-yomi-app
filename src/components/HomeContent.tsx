import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

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

export default function HomeContent({
  streak,
  last7Days,
}: HomeContentProps) {
  
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
            let barColor: string = THEME.colors.textMuted;
            let opacity = 0.3;
            
            if (isLearned) {
              barHeight = 70;
              barColor = THEME.colors.accent;
              opacity = 1;
            } else if (isToday) {
              barHeight = 40;
              barColor = THEME.colors.accent;
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
                <Text style={[styles.dayLabel, isToday && { color: THEME.colors.accent, fontWeight: '800' }]}>
                  {day.dayNameHe}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  streakCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(201,150,60,0.15)',
    ...THEME.shadow.cardMedium,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  streakTitle: {
    color: THEME.colors.textSecondary,
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
    color: THEME.colors.accent,
    fontSize: 40,
    fontWeight: '900',
    textShadowColor: 'rgba(201,150,60,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  streakLabel: {
    color: THEME.colors.textSecondary,
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
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'space-between',
  },
  gridIcon: {
    backgroundColor: THEME.colors.background,
    padding: 8,
    borderRadius: 12,
  },
  gridTextContainer: {
    alignItems: 'flex-start',
  },
  gridTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  gridSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLink: {
    color: THEME.colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});
