import { useState, useCallback, useRef, useEffect } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent, ScrollView } from 'react-native';
import { useAnimatedRef, type SharedValue } from 'react-native-reanimated';

interface UseScrollProgressOptions {
  progressShared?: SharedValue<number>;
  fabThreshold?: number;
  resetKey?: string;
}

export function useScrollProgress({
  progressShared,
  fabThreshold = 350,
  resetKey,
}: UseScrollProgressOptions = {}) {
  const [showFab, setShowFab] = useState(false);
  const scrollViewRef = useAnimatedRef<ScrollView>();
  const scrollYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const isScrollingToTopRef = useRef(false);
  const progressSharedRef = useRef(progressShared);
  progressSharedRef.current = progressShared;

  useEffect(() => {
    scrollYRef.current = 0;
    lastScrollYRef.current = 0;
    isScrollingToTopRef.current = false;
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setShowFab(false);
    if (progressSharedRef.current) {
      progressSharedRef.current.value = 0;
    }
  }, [resetKey, scrollViewRef]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;
      const deltaY = scrollY - lastScrollYRef.current;
      scrollYRef.current = scrollY;
      lastScrollYRef.current = scrollY;
      const maxScroll = contentSize.height - layoutMeasurement.height;

      if (progressSharedRef.current) {
        if (maxScroll > 0) {
          progressSharedRef.current.value = Math.min(1, Math.max(0, scrollY / maxScroll));
        } else {
          progressSharedRef.current.value = 0;
        }
      }

      if (scrollY <= fabThreshold) {
        isScrollingToTopRef.current = false;
        setShowFab(false);
      } else if (isScrollingToTopRef.current) {
        setShowFab(false);
      } else if (deltaY > 6) {
        setShowFab(false);
      } else if (deltaY < -6) {
        setShowFab(true);
      }
    },
    [fabThreshold],
  );

  const scrollToTop = useCallback(() => {
    isScrollingToTopRef.current = true;
    setShowFab(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [scrollViewRef]);

  return {
    scrollViewRef,
    scrollYRef,
    showFab,
    handleScroll,
    scrollToTop,
  };
}
