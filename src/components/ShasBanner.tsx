import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface ShasBannerProps {
  learnedCount: number;
  totalPages: number;
  percentage: number;
  onPress?: () => void;
}

export default function ShasBanner({ learnedCount, totalPages, percentage, onPress }: ShasBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>התקדמות הש"ס הכללית</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.statsRow}>
              <Text style={styles.percentageText}>{percentage}%</Text>
              <Text style={styles.countText}>{learnedCount} מתוך {totalPages} דפים</Text>
            </View>
            
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
          </View>
        </View>
        
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.1)',
      ...theme.shadow.card,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 10,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(201,150,60,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    progressSection: {
      gap: 8,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    percentageText: {
      color: theme.colors.accent,
      fontSize: 24,
      fontWeight: '900',
    },
    countText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    progressBarBg: {
      height: 6,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 3,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 3,
    },
    chevronContainer: {
      marginEnd: 10,
    },
  });
