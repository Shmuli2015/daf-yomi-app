import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import type { ScrollView } from 'react-native';
import {
  Easing,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
const ADAPTED_CLOSE_MIN = 320;
const ADAPTED_CLOSE_MAX = 520;
const OPEN_EASING = Easing.out(Easing.cubic);
const CLOSE_EASING = Easing.in(Easing.cubic);
const SMOOTH_CLOSE_EASING = Easing.inOut(Easing.cubic);
const HEIGHT_EPSILON = 1;

export interface AccordionCollapseScroll {
  scrollViewRef: AnimatedRef<ScrollView>;
  active: SharedValue<number>;
  index: SharedValue<number>;
  startHeight: SharedValue<number>;
  initialNextY: SharedValue<number>;
  startScrollY: SharedValue<number>;
  onEnd: () => void;
}

export interface UseAccordionSlideOptions {
  collapseScroll?: AccordionCollapseScroll;
  collapseCardIndex?: number;
  adaptCloseToHeight?: boolean;
}

function closeDurationForHeight(height: number, adaptCloseToHeight: boolean) {
  if (!adaptCloseToHeight) {
    return CLOSE_DURATION;
  }
  return Math.min(ADAPTED_CLOSE_MAX, Math.max(ADAPTED_CLOSE_MIN, height * 0.22));
}

export function useAccordionSlide(
  isExpanded: boolean,
  options: UseAccordionSlideOptions = {},
) {
  const { collapseScroll, collapseCardIndex = -1, adaptCloseToHeight = false } = options;
  const [isRendered, setIsRendered] = useState(isExpanded);
  const [isHeightLocked, setIsHeightLocked] = useState(!isExpanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const measuredHeight = useSharedValue(0);
  const animatedHeight = useSharedValue(0);
  const skipMountEffect = useRef(true);
  const collapseOnEnd = collapseScroll?.onEnd;

  useAnimatedReaction(
    () => animatedHeight.value,
    (height) => {
      if (!collapseScroll) {
        return;
      }
      if (collapseScroll.active.value !== 1 || collapseScroll.index.value !== collapseCardIndex) {
        return;
      }
      if (collapseScroll.startHeight.value < 0) {
        collapseScroll.startHeight.value = height;
        return;
      }

      const removed = collapseScroll.startHeight.value - height;
      if (removed > 0) {
        const nextY = collapseScroll.initialNextY.value - removed;
        const target = Math.min(collapseScroll.startScrollY.value, Math.max(0, nextY));
        scrollTo(collapseScroll.scrollViewRef, 0, target, false);
      }

      if (height <= 0.5) {
        collapseScroll.active.value = 0;
        if (collapseOnEnd) {
          runOnJS(collapseOnEnd)();
        }
      }
    },
  );

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
      {
        duration: closeDurationForHeight(measuredHeight.value, adaptCloseToHeight),
        easing: adaptCloseToHeight ? SMOOTH_CLOSE_EASING : CLOSE_EASING,
      },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
  }, [
    isExpanded,
    isHeightLocked,
    animatedHeight,
    measuredHeight,
    finishClose,
    finishOpen,
    adaptCloseToHeight,
  ]);

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
