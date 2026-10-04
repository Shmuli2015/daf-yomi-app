import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { createReadingProgressBarStyles } from './ReadingProgressBar.styles';

interface ReadingProgressBarProps {
  progress: SharedValue<number>;
  accentColor?: string;
}

export default function ReadingProgressBar({
  progress,
  accentColor,
}: ReadingProgressBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReadingProgressBarStyles(theme), [theme]);
  const activeColor = accentColor || theme.colors.accent;

  const indicatorStyle = useAnimatedStyle(() => ({
    width: `${Math.round(Math.min(1, Math.max(0, progress.value)) * 100)}%`,
    backgroundColor: activeColor,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </View>
  );
}
