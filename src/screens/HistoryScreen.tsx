import React, { useMemo, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import MasechetGrid from '../components/Shas/MasechetGrid';
import { useAppStore } from '../store/useAppStore';
import { SHAS_MASECHTOT } from '../data/shas';
import { getMasechetProgress, getMasechetDafim } from '../utils/shas';
import { THEME } from '../theme';

const RING_SIZE = 148;
const RING_RADIUS = 56;
const STROKE_WIDTH = 13;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Animated SVG circle using RN Animated
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ShasRing({ progress }: { progress: number }) {
  const dashOffset = useRef(new Animated.Value(CIRCUMFERENCE)).current;

  useEffect(() => {
    Animated.timing(dashOffset, {
      toValue: CIRCUMFERENCE * (1 - progress),
      duration: 1300,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG props require JS driver
    }).start();
  }, [progress]);

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={THEME.colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={THEME.colors.accent}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset as any}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

function StatPill({ label, value, delay }: { label: string; value: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statPill, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { history } = useAppStore();

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 450, delay: 50, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: 450, delay: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalDafim = useMemo(() => SHAS_MASECHTOT.reduce((acc, m) => acc + m.pages, 0), []);
  const learnedDafim = useMemo(() => history.filter(r => r.status === 'learned').length, [history]);
  const completedMasechtos = useMemo(
    () => SHAS_MASECHTOT.filter(m => {
      const total = getMasechetDafim(m.he).length;
      return total > 0 && getMasechetProgress(m.he, history) === total;
    }).length,
    [history]
  );

  const progress = totalDafim > 0 ? learnedDafim / totalDafim : 0;
  const percentage = (progress * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerRow}>
            <View style={styles.accentBar} />
            <Text style={styles.pageTitle}>התקדמות בש״ס</Text>
          </View>
          <Text style={styles.pageSubtitle}>מעקב לימוד של כל מסכתות הש״ס</Text>
        </View>

        {/* Progress Hero Card */}
        <Animated.View style={[styles.heroCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
          <View style={styles.ringSection}>
            <View style={styles.ringContainer}>
              <ShasRing progress={progress} />
              <View style={styles.ringCenter}>
                <Text style={styles.ringPercent}>{percentage}%</Text>
                <Text style={styles.ringPercentLabel}>מהש״ס</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatPill label="דפים נלמדו" value={learnedDafim.toString()} delay={200} />
            <View style={styles.statDivider} />
            <StatPill label="מסכתות הושלמו" value={completedMasechtos.toString()} delay={300} />
            <View style={styles.statDivider} />
            <StatPill label="דפים בש״ס" value={totalDafim.toString()} delay={400} />
          </View>
        </Animated.View>

        <MasechetGrid />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 100 },
  pageHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  accentBar: {
    width: 4,
    height: 32,
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  ringSection: { alignItems: 'center', marginBottom: 20 },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPercent: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: -0.5,
  },
  ringPercentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: { width: 1, height: 32, backgroundColor: THEME.colors.border },
  statPill: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.accent,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 2,
  },
});
