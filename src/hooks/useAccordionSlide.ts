import { useCallback, useEffect, useRef, useState } from 'react';
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
const HEIGHT_EPSILON = 1;

export function useAccordionSlide(isExpanded: boolean) {
  const [isRendered, setIsRendered] = useState(isExpanded);
  const [isHeightLocked, setIsHeightLocked] = useState(!isExpanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const measuredHeight = useSharedValue(0);
  const animatedHeight = useSharedValue(0);
  const skipMountEffect = useRef(true);

  const finishClose = useCallback(() => {
    setIsRendered(false);
    setIsAnimating(false);
  }, []);

  const finishOpen = useCallback(() => {
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    if (skipMountEffect.current) {
      skipMountEffect.current = false;
      return;
    }

    if (isExpanded) {
      setIsRendered(true);
      if (isHeightLocked && measuredHeight.value > 0) {
        setIsAnimating(true);
        animatedHeight.value = withTiming(
          measuredHeight.value,
          {
            duration: OPEN_DURATION,
            easing: OPEN_EASING,
          },
          (finished) => {
            if (finished) {
              runOnJS(finishOpen)();
            }
          },
        );
      }
      return;
    }

    if (!isHeightLocked) {
      animatedHeight.value = measuredHeight.value;
      setIsHeightLocked(true);
      return;
    }

    setIsAnimating(true);
    animatedHeight.value = withTiming(
      0,
      { duration: CLOSE_DURATION, easing: CLOSE_EASING },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      }
    );
  }, [isExpanded, isHeightLocked, animatedHeight, measuredHeight, finishClose, finishOpen]);

  const onContentLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (nextHeight <= 0) {
      return;
    }

    const previousHeight = measuredHeight.value;
    if (Math.abs(previousHeight - nextHeight) < HEIGHT_EPSILON) {
      return;
    }

    measuredHeight.value = nextHeight;

    if (!isExpanded || !isHeightLocked) {
      return;
    }

    if (previousHeight === 0 || animatedHeight.value < HEIGHT_EPSILON) {
      setIsAnimating(true);
      animatedHeight.value = withTiming(
        nextHeight,
        {
          duration: OPEN_DURATION,
          easing: OPEN_EASING,
        },
        (finished) => {
          if (finished) {
            runOnJS(finishOpen)();
          }
        },
      );
      return;
    }

    animatedHeight.value = nextHeight;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  return { isRendered, onContentLayout, animatedStyle, isHeightLocked, isAnimating };
}
