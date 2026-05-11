import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface StatPillProps {
  label: string;
  value: string;
  delay: number;
}

export default function StatPill({ label, value, delay }: StatPillProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View style={[styles.statPill, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    statPill: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
    statValue: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.accent,
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      textAlign: 'center',
      marginTop: 2,
    },
  });
