import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface ShasBannerProps {
  learnedCount: number;
  totalPages: number;
  percentage: number;
  onPress?: () => void;
}

export default function ShasBanner({ learnedCount, totalPages, percentage, onPress }: ShasBannerProps) {
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
              <Ionicons name="trophy" size={20} color={THEME.colors.accent} />
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
          <Ionicons name="chevron-back" size={20} color={THEME.colors.textMuted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,150,60,0.1)',
    ...THEME.shadow.card,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
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
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  progressSection: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  percentageText: {
    color: THEME.colors.accent,
    fontSize: 24,
    fontWeight: '900',
  },
  countText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: THEME.colors.background,
    borderRadius: 3,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 3,
  },
  chevronContainer: {
    marginLeft: 10,
  },
});
