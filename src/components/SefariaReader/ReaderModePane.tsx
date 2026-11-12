import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { ViewMode } from './ReaderToolbar';
import type { NavDirection } from '../../hooks/useDafReader';

interface ReaderModePaneProps {
  viewMode: ViewMode;
  pageKey?: string;
  navDirection?: NavDirection;
  children: React.ReactNode;
}

export default function ReaderModePane({
  viewMode,
  pageKey,
  navDirection,
  children,
}: ReaderModePaneProps) {
  const skipEnter = useRef(true);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (skipEnter.current) {
      skipEnter.current = false;
      return;
    }
    const fromX = navDirection === 'next' ? -28 : navDirection === 'prev' ? 28 : 0;
    translateX.value = fromX;
    opacity.value = fromX === 0 ? 0.72 : 1;
    translateX.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(1, { duration: 180 });
  }, [navDirection, opacity, pageKey, translateX, viewMode]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.pane}>
      <Animated.View key={`${viewMode}-${pageKey || 'default'}`} style={[styles.pane, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pane: {
    flex: 1,
  },
});
