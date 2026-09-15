import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { ViewMode } from './ReaderToolbar';

interface ReaderModePaneProps {
  viewMode: ViewMode;
  children: React.ReactNode;
}

export default function ReaderModePane({ viewMode, children }: ReaderModePaneProps) {
  const skipEnter = useRef(true);

  useEffect(() => {
    skipEnter.current = false;
  }, []);

  return (
    <View style={styles.pane}>
      <Animated.View
        key={viewMode}
        entering={skipEnter.current ? undefined : FadeIn.duration(180)}
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
