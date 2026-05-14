import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

type ScreenTopGradientProps = {
  style?: StyleProp<ViewStyle>;
};

export default function ScreenTopGradient({ style }: ScreenTopGradientProps) {
  const theme = useTheme();
  const bg = theme.colors.background;

  return (
    <LinearGradient
      colors={[theme.colors.accent + '26', theme.colors.accent + '0C', bg]}
      locations={[0, 0.42, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      pointerEvents="none"
      style={[styles.fill, style]}
    />
  );
}

const styles = StyleSheet.create({
  fill: StyleSheet.absoluteFillObject,
});
