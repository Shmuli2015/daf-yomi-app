import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { THEME } from '../theme';

const HEBREW_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

interface DayRecord {
  date: Date;
  dateStr: string;
  status: string;
  dayName: string;
}

interface HomeContentProps {
  isLearned: boolean;
  handleToggle: () => void;
  streak: number;
  last7Days: DayRecord[];
}

export default function HomeContent({
  isLearned,
  handleToggle,
  streak,
  last7Days,
}: HomeContentProps) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const streakBounce = useRef(new Animated.Value(1)).current;
  const prevStreakRef = useRef(streak);

  // entrance animations
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(16)).current;
  const stat1Opacity = useRef(new Animated.Value(0)).current;
  const stat1TranslateY = useRef(new Animated.Value(16)).current;
  const stat2Opacity = useRef(new Animated.Value(0)).current;
  const stat2TranslateY = useRef(new Animated.Value(16)).current;
  const weekOpacity = useRef(new Animated.Value(0)).current;
  const weekTranslateY = useRef(new Animated.Value(16)).current;

  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(ctaTranslateY, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(stat1Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(stat1TranslateY, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(stat2Opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(stat2TranslateY, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(weekOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(weekTranslateY, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Pulse ring when not yet learned
  useEffect(() => {
    pulseLoopRef.current?.stop();
    if (!isLearned) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1.14, duration: 950, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.55, duration: 950, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1, duration: 950, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0, duration: 950, useNativeDriver: true }),
          ]),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      Animated.timing(pulseOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
    return () => { pulseLoopRef.current?.stop(); };
  }, [isLearned]);

  // Streak bounce on change
  useEffect(() => {
    if (streak !== prevStreakRef.current) {
      Animated.sequence([
        Animated.spring(streakBounce, { toValue: 1.45, damping: 5, stiffness: 220, useNativeDriver: true }),
        Animated.spring(streakBounce, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }),
      ]).start();
      prevStreakRef.current = streak;
    }
  }, [streak]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.92, damping: 8, stiffness: 300, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }),
    ]).start();
    handleToggle();
  };

  const today = new Date();

  return (
    <View style={styles.container}>
      {/* CTA Button */}
      <Animated.View style={{ opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] }}>
        <View style={styles.btnWrapper}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.pulseRing,
              { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
            ]}
          />
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={1}
              style={[styles.ctaButton, isLearned ? styles.ctaButtonDone : styles.ctaButtonPending]}
            >
              <Text style={[styles.ctaText, isLearned ? styles.ctaTextDone : styles.ctaTextPending]}>
                {isLearned ? '✓  הושלם' : 'סיימתי את הדף!'}
              </Text>
              {isLearned && <Text style={styles.ctaSubtext}>לחץ לביטול</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Animated.View
          style={[styles.statCard, { opacity: stat1Opacity, transform: [{ translateY: stat1TranslateY }] }]}
        >
          <Text style={styles.statLabel}>רצף נוכחי</Text>
          <View style={styles.streakRow}>
            <Animated.Text style={[styles.streakNumber, { transform: [{ scale: streakBounce }] }]}>
              {streak}
            </Animated.Text>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.statCard, { opacity: stat2Opacity, transform: [{ translateY: stat2TranslateY }] }]}
        >
          <Text style={styles.statLabel}>סטטוס</Text>
          <View style={[styles.statusBadge, isLearned ? styles.statusBadgeDone : styles.statusBadgePending]}>
            <Text style={[styles.statusText, isLearned ? styles.statusTextDone : styles.statusTextPending]}>
              {isLearned ? 'נלמד ✓' : 'בהמתנה'}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Week Strip */}
      {last7Days.length > 0 && (
        <Animated.View
          style={[styles.weekStrip, { opacity: weekOpacity, transform: [{ translateY: weekTranslateY }] }]}
        >
          <Text style={styles.weekTitle}>7 ימים אחרונים</Text>
          <View style={styles.weekDays}>
            {last7Days.map((day, index) => {
              const isDayToday = day.date.toDateString() === today.toDateString();
              const isDayLearned = day.status === 'learned';
              const dayLetter = HEBREW_DAYS[day.date.getDay()];
              return (
                <View key={index} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayCircle,
                      isDayLearned && styles.dayCircleLearned,
                      isDayToday && !isDayLearned && styles.dayCircleToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayLetter,
                        isDayLearned && styles.dayLetterLearned,
                        isDayToday && !isDayLearned && styles.dayLetterToday,
                      ]}
                    >
                      {dayLetter}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: -36,
    gap: 12,
  },
  btnWrapper: {
    alignItems: 'center',
  },
  pulseRing: {
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: THEME.colors.accent,
    backgroundColor: 'transparent',
  },
  ctaButton: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
  },
  ctaButtonPending: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.3,
  },
  ctaButtonDone: {
    backgroundColor: THEME.colors.successLight,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    shadowColor: THEME.colors.success,
    shadowOpacity: 0.12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  ctaTextPending: { color: 'white' },
  ctaTextDone: { color: '#16A34A' },
  ctaSubtext: {
    color: '#16A34A',
    opacity: 0.5,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statLabel: {
    color: THEME.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: THEME.colors.accent,
  },
  fireEmoji: { fontSize: 24 },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeDone: { backgroundColor: THEME.colors.successLight },
  statusBadgePending: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 14, fontWeight: '900' },
  statusTextDone: { color: '#16A34A' },
  statusTextPending: { color: THEME.colors.muted },
  weekStrip: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekTitle: {
    color: THEME.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'right',
    marginBottom: 12,
  },
  weekDays: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  dayItem: { alignItems: 'center' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleLearned: { backgroundColor: THEME.colors.accent },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    backgroundColor: 'transparent',
  },
  dayLetter: { fontSize: 14, fontWeight: '900', color: THEME.colors.muted },
  dayLetterLearned: { color: 'white' },
  dayLetterToday: { color: THEME.colors.primary },
});
