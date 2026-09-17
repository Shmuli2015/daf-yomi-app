import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
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

  useEffect(() => {
    skipEnter.current = false;
  }, []);

  const getEnteringAnimation = () => {
    if (skipEnter.current) return undefined;
    if (navDirection === 'next') {
      return SlideInLeft.duration(200);
    }
    if (navDirection === 'prev') {
      return SlideInRight.duration(200);
    }
    return FadeIn.duration(180);
  };

  const compositeKey = `${viewMode}-${pageKey || 'default'}`;

  return (
    <View style={styles.pane}>
      <Animated.View
        key={compositeKey}
        entering={getEnteringAnimation()}
        exiting={FadeOut.duration(120)}
        style={styles.pane}
      >
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
