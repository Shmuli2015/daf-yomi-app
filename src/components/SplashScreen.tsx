import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface SplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

export default function SplashScreen({ isReady, onFinish }: SplashScreenProps) {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, damping: 10, stiffness: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.timing(dividerScale, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
    ]).start(() => {
      shimmerLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1.06, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      shimmerLoopRef.current.start();
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      shimmerLoopRef.current?.stop();
      Animated.timing(shimmer, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }).start(() => onFinish());
    }
  }, [isReady]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, { transform: [{ scale }], opacity }]}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
          <Ionicons name="book" size={52} color={THEME.colors.accent} />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: shimmer }] }}>
          <Text style={styles.title}>דף יומי</Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          לימוד יומי של גמרא
        </Animated.Text>

        <Animated.View style={[styles.dividerRow, { transform: [{ scaleX: dividerScale }] }]}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  bgCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(201,150,60,0.05)',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -40,
    left: -60,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(201,150,60,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(201,150,60,0.35)',
  },
  title: {
    fontSize: 54,
    fontWeight: '900',
    color: THEME.colors.accent,
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
  },
  dividerLine: {
    width: 36,
    height: 1.5,
    backgroundColor: 'rgba(201,150,60,0.4)',
    borderRadius: 1,
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.colors.accent,
    opacity: 0.7,
  },
});
