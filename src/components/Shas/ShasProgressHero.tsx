import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { THEME } from '../../theme';
import ShasRing from './ShasRing';
import StatPill from './StatPill';

interface ShasProgressHeroProps {
  progress: number;
  percentage: string;
  learnedDafim: number;
  completedMasechtos: number;
  totalDafim: number;
}

export default function ShasProgressHero({
  progress,
  percentage,
  learnedDafim,
  completedMasechtos,
  totalDafim,
}: ShasProgressHeroProps) {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 450, delay: 50, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: 450, delay: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.heroCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
      <View style={styles.ringSection}>
        <ShasRing progress={progress} percentage={percentage} />
      </View>

      <View style={styles.statsRow}>
        <StatPill label="דפים נלמדו" value={learnedDafim.toString()} delay={200} />
        <View style={styles.statDivider} />
        <StatPill label="מסכתות הושלמו" value={completedMasechtos.toString()} delay={300} />
        <View style={styles.statDivider} />
        <StatPill label="דפים בש״ס" value={totalDafim.toString()} delay={400} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  statsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: { width: 1, height: 32, backgroundColor: THEME.colors.border },
});
