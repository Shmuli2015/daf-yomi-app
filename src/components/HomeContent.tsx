import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface DayRecord {
  date: Date;
  dateStr: string;
  status: string;
  dayName: string;
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
          {last7Days.map((day, index) => {
            const isToday = index === last7Days.length - 1;
            const isLearned = day.status === 'learned';
            let barHeight = 10;
            if (isLearned) {
              barHeight = 40 + (index * 5);
            } else if (isToday) {
              barHeight = 80;
            }
            
            return (
              <View key={index} style={styles.barColumn}>
                <View 
                  style={[
                    styles.bar, 
                    { height: barHeight, backgroundColor: isToday ? THEME.colors.accent : THEME.colors.border }
                  ]} 
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Ionicons name="star-outline" size={24} color={THEME.colors.accent} style={styles.gridIcon} />
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridTitle}>מועדפים</Text>
              <Text style={styles.gridSubtitle}>סוגיות ששמרת</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Ionicons name="time-outline" size={24} color={THEME.colors.textSecondary} style={styles.gridIcon} />
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridTitle}>היסטוריה</Text>
              <Text style={styles.gridSubtitle}>הדפים האחרונים</Text>
            </View>
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Ionicons name="create-outline" size={24} color={THEME.colors.textSecondary} style={styles.gridIcon} />
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridTitle}>הערות</Text>
              <Text style={styles.gridSubtitle}>החידושים שלי</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Ionicons name="people-outline" size={24} color={THEME.colors.textSecondary} style={styles.gridIcon} />
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridTitle}>חברותא</Text>
              <Text style={styles.gridSubtitle}>לימוד משותף</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ציוני דרך</Text>
        <Text style={styles.sectionLink}>צפה בכל ההישגים</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 16,
  },
  streakCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  streakHeader: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  streakTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakValue: {
    color: THEME.colors.accent,
    fontSize: 32,
    fontWeight: '900',
  },
  streakLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  barColumn: {
    width: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
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
    flexDirection: 'row-reverse',
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
    alignItems: 'flex-end',
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
    flexDirection: 'row-reverse',
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
