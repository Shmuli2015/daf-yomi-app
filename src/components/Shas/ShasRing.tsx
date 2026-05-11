import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme';

const RING_SIZE = 148;
const RING_RADIUS = 56;
const STROKE_WIDTH = 13;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ShasRingProps {
  progress: number;
  percentage: string;
}

export default function ShasRing({ progress, percentage }: ShasRingProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const dashOffset = useRef(new Animated.Value(CIRCUMFERENCE)).current;

  useEffect(() => {
    Animated.timing(dashOffset, {
      toValue: CIRCUMFERENCE * (1 - progress),
      duration: 1300,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.ringContainer}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <G transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={theme.colors.progressTrack}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={theme.colors.accent}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset as any}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPercent}>{percentage}%</Text>
        <Text style={styles.ringPercentLabel}>מהש״ס</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
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
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    ringPercentLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
