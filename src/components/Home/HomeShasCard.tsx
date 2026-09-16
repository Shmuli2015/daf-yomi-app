import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { createHomeShasCardStyles } from './HomeShasCard.styles';
import { formatProgressCount } from '../../utils/dafStatus';

interface HomeShasCardProps {
  shasLearnedCount: number;
  shasTotalPages: number;
  shasPercentage: number;
  onPressShas: () => void;
}

const HomeShasCard = React.memo(function HomeShasCard({
  shasLearnedCount,
  shasTotalPages,
  shasPercentage,
  onPressShas,
}: HomeShasCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeShasCardStyles(theme), [theme]);
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withTiming(shasPercentage, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });
  }, [shasPercentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  return (
    <TouchableOpacity
      style={styles.shasCard}
      onPress={onPressShas}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="התקדמות הש״ס"
    >
      <LinearGradient
        colors={[theme.colors.accent + '10', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.shasRow}>
        <View style={styles.shasIcon}>
          <Ionicons name="trophy" size={20} color={theme.colors.accent} />
        </View>

        <View style={styles.shasCopy}>
          <Text style={styles.shasTitle}>התקדמות הש״ס</Text>
          <Text style={styles.shasCount}>
            {formatProgressCount(shasLearnedCount)} מתוך {shasTotalPages} דפים
          </Text>
        </View>

        <View style={styles.shasPctContainer}>
          <Text style={styles.shasPct}>{shasPercentage}%</Text>
          <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
      </View>
    </TouchableOpacity>
  );
});

export default HomeShasCard;
