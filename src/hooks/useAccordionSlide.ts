import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
const OPEN_EASING = Easing.out(Easing.cubic);
const CLOSE_EASING = Easing.in(Easing.cubic);

export function useAccordionSlide(isExpanded: boolean) {
  const [isRendered, setIsRendered] = useState(isExpanded);
  const measuredHeight = useSharedValue(0);
  const animatedHeight = useSharedValue(0);

  const finishClose = useCallback(() => {
    setIsRendered(false);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      setIsRendered(true);
      if (measuredHeight.value > 0) {
        animatedHeight.value = withTiming(measuredHeight.value, {
          duration: OPEN_DURATION,
          easing: OPEN_EASING,
        });
      }
      return;
    }

    animatedHeight.value = withTiming(
      0,
      { duration: CLOSE_DURATION, easing: CLOSE_EASING },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      }
    );
  }, [isExpanded, animatedHeight, measuredHeight, finishClose]);

  const onContentLayout = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight <= 0) {
      return;
    }

    const wasUnmeasured = measuredHeight.value === 0;
    measuredHeight.value = nextHeight;

    if (!isExpanded) {
      return;
    }

    if (wasUnmeasured || animatedHeight.value === 0) {
      animatedHeight.value = withTiming(nextHeight, {
        duration: OPEN_DURATION,
        easing: OPEN_EASING,
      });
      return;
    }

    animatedHeight.value = nextHeight;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  return { isRendered, onContentLayout, animatedStyle };
}
