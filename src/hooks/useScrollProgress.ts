import { useState, useCallback, useRef, useEffect } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent, ScrollView } from 'react-native';
import { useAnimatedRef } from 'react-native-reanimated';

interface UseScrollProgressOptions {
  onProgressChange?: (progress: number) => void;
  fabThreshold?: number;
  resetKey?: string;
}

export function useScrollProgress({
  onProgressChange,
  fabThreshold = 350,
  resetKey,
}: UseScrollProgressOptions = {}) {
  const [showFab, setShowFab] = useState(false);
  const scrollViewRef = useAnimatedRef<ScrollView>();
  const scrollYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const isScrollingToTopRef = useRef(false);

  useEffect(() => {
    scrollYRef.current = 0;
    lastScrollYRef.current = 0;
    isScrollingToTopRef.current = false;
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setShowFab(false);
    onProgressChange?.(0);
  }, [resetKey, onProgressChange]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;
      const deltaY = scrollY - lastScrollYRef.current;
      scrollYRef.current = scrollY;
      lastScrollYRef.current = scrollY;
      const maxScroll = contentSize.height - layoutMeasurement.height;

      if (maxScroll > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
        onProgressChange?.(progress);
      } else {
        onProgressChange?.(0);
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
    [onProgressChange, fabThreshold],
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
