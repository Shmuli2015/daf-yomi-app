import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useSplashScreenAnimations } from '../hooks/useSplashScreenAnimations';
import { getRandomQuote } from '../utils/quotes';

interface SplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

export default function SplashScreen({ isReady, onFinish }: SplashScreenProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const randomQuote = useMemo(() => getRandomQuote(), []);
  const {
    scale,
    opacity,
    containerOpacity,
    shimmer,
    iconScale,
    subtitleOpacity,
    dividerScale,
  } = useSplashScreenAnimations(isReady, onFinish);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, { transform: [{ scale }], opacity }]}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
          <Ionicons name="book" size={52} color={theme.colors.accent} />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: shimmer }] }}>
          <Text style={styles.title}>מסע דף</Text>
        </Animated.View>

        <Animated.View style={[styles.quoteCard, { opacity: subtitleOpacity }]}>
          <Text style={styles.subtitle}>{randomQuote}</Text>
        </Animated.View>

        <Animated.View style={[styles.dividerRow, { transform: [{ scaleX: dividerScale }] }]}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    bgCircle1: {
      position: 'absolute',
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: theme.colors.accent,
      opacity: 0.04,
      top: -80,
      right: -80,
    },
    bgCircle2: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: theme.colors.accent,
      opacity: 0.03,
      bottom: -50,
      left: -60,
    },
    content: {
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 28,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 28,
      borderWidth: 1.5,
      borderColor: theme.colors.accentBorder,
    },
    title: {
      fontSize: 54,
      fontWeight: '900',
      color: theme.colors.accent,
      textAlign: 'center',
      letterSpacing: -1.5,
    },
    quoteCard: {
      marginTop: 14,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxWidth: 320,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 20,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      gap: 8,
    },
    dividerLine: {
      width: 36,
      height: 1.5,
      backgroundColor: theme.colors.accentBorder,
      borderRadius: 1,
    },
    dividerDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.accent,
      opacity: 0.7,
    },
  });


