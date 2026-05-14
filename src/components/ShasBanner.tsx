import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(percentage, { duration: 1000 });
  }, [percentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={[theme.colors.accent + '15', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={18} color={theme.colors.accent} />
            </View>
            <View>
              <Text style={styles.title}>התקדמות הש"ס</Text>
              <Text style={styles.subtitle}>המסע שלך לסיים את הש"ס</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.statsRow}>
              <View style={styles.mainStat}>
                <Text style={styles.percentageText}>{percentage}</Text>
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
              <Text style={styles.countText}>
                {learnedCount} מתוך {totalPages} דפים
              </Text>
            </View>
            
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, animatedProgressStyle]}>
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.accent + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </View>
        </View>
        
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.accent} />
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
      borderRadius: 28,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.cardMedium,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    progressSection: {
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    mainStat: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    percentageText: {
      color: theme.colors.accent,
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 36,
    },
    percentageSymbol: {
      color: theme.colors.accent,
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 2,
    },
    countText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 4,
    },
    progressBarBg: {
      height: 10,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 5,
    },
    chevronContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
  });

