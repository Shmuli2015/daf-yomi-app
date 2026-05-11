import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme';
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
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    heroCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 28,
      paddingVertical: 24,
      paddingHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
      elevation: 4,
    },
    ringSection: { alignItems: 'center', marginBottom: 20 },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statDivider: { width: 1, height: 32, backgroundColor: theme.colors.border },
  });
