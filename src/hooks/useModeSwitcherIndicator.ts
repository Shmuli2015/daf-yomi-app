import { useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SWITCHER_PADDING = 3;
const INDICATOR_DURATION = 220;
const INDICATOR_EASING = Easing.out(Easing.cubic);

export function useModeSwitcherIndicator(activeId: string, ids: readonly string[]) {
  const index = Math.max(0, ids.indexOf(activeId));
  const count = Math.max(1, ids.length);
  const width = useSharedValue(0);
  const progress = useSharedValue(index);
  const tabCount = useSharedValue(count);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    tabCount.value = count;
  }, [count, tabCount]);

  useEffect(() => {
    progress.value = withTiming(index, {
      duration: INDICATOR_DURATION,
      easing: INDICATOR_EASING,
    });
  }, [index, progress]);

  const onSwitcherLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
    setIsReady(true);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const inner = Math.max(0, width.value - SWITCHER_PADDING * 2);
    const tabW = inner / tabCount.value;
    const offset = SWITCHER_PADDING + progress.value * tabW;
    const opacity = width.value > 0 ? 1 : 0;
    return { width: tabW, left: offset, opacity };
  });

  return { onSwitcherLayout, indicatorStyle, isReady };
}
