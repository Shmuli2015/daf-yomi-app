import { useState, useCallback, useRef, useEffect } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent, ScrollViewInstance } from 'react-native';
import { useAnimatedRef, type SharedValue } from 'react-native-reanimated';
import { useAutoScroll, type AutoScrollSpeedLevel } from './useAutoScroll';

interface UseScrollProgressOptions {
  progressShared?: SharedValue<number>;
  fabThreshold?: number;
  resetKey?: string;
  initialOffset?: number;
  onOffsetChange?: (offset: number) => void;
  autoScrollActive?: boolean;
  autoScrollLevel?: AutoScrollSpeedLevel;
  autoScrollPaused?: boolean;
  onAutoScrollPause?: () => void;
}

export function useScrollProgress({
  progressShared,
  fabThreshold = 350,
  resetKey,
  initialOffset = 0,
  onOffsetChange,
  autoScrollActive = false,
  autoScrollLevel = 3,
  autoScrollPaused = false,
  onAutoScrollPause,
}: UseScrollProgressOptions = {}) {
  const [showFab, setShowFab] = useState(false);
  const scrollViewRef = useAnimatedRef<ScrollViewInstance>();
  const scrollYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const maxScrollRef = useRef(0);
  const isScrollingToTopRef = useRef(false);
  const pendingRestoreRef = useRef(false);
  const restoredOffsetRef = useRef(0);
  const progressSharedRef = useRef(progressShared);
  const initialOffsetRef = useRef(initialOffset);
  const onOffsetChangeRef = useRef(onOffsetChange);
  const onAutoScrollPauseRef = useRef(onAutoScrollPause);
  progressSharedRef.current = progressShared;
  initialOffsetRef.current = initialOffset;
  onOffsetChangeRef.current = onOffsetChange;
  onAutoScrollPauseRef.current = onAutoScrollPause;

  useAutoScroll({
    scrollViewRef,
    scrollYRef,
    active: autoScrollActive,
    level: autoScrollLevel,
    isPaused: autoScrollPaused,
    maxScrollRef,
    onReachEnd: onAutoScrollPause,
  });

  const applyOffset = useCallback((offset: number) => {
    scrollViewRef.current?.scrollTo({ y: offset, animated: false });
  }, [scrollViewRef]);

  useEffect(() => {
    const offset = Math.max(0, initialOffsetRef.current);
    restoredOffsetRef.current = offset;
    pendingRestoreRef.current = offset > 1;
    scrollYRef.current = offset;
    lastScrollYRef.current = offset;
    isScrollingToTopRef.current = false;
    applyOffset(offset);
    setShowFab(false);
    if (progressSharedRef.current && offset <= 1) {
      progressSharedRef.current.value = 0;
    }
  }, [resetKey, applyOffset]);

  const handleContentSizeChange = useCallback((_width: number, height: number) => {
    if (!pendingRestoreRef.current) return;
    const offset = restoredOffsetRef.current;
    if (offset > 0 && height > offset) {
      applyOffset(offset);
    }
  }, [applyOffset]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;
      if (pendingRestoreRef.current && scrollY < 1 && restoredOffsetRef.current > 1) {
        return;
      }
      pendingRestoreRef.current = false;
      onOffsetChangeRef.current?.(scrollY);
      const deltaY = scrollY - lastScrollYRef.current;
      scrollYRef.current = scrollY;
      lastScrollYRef.current = scrollY;
      const maxScroll = contentSize.height - layoutMeasurement.height;

      maxScrollRef.current = maxScroll;

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

  const handleScrollBeginDrag = useCallback(() => {
    if (autoScrollActive && !autoScrollPaused) {
      onAutoScrollPauseRef.current?.();
    }
  }, [autoScrollActive, autoScrollPaused]);

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
    handleScrollBeginDrag,
    handleContentSizeChange,
    scrollToTop,
  };
}
