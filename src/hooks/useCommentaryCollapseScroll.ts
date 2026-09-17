import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { ScrollView } from 'react-native';
import { useSharedValue, type AnimatedRef } from 'react-native-reanimated';
import type { AccordionCollapseScroll } from './useAccordionSlide';

interface CardLayout {
  y: number;
  height: number;
}

interface UseCommentaryCollapseScrollOptions {
  scrollViewRef: AnimatedRef<ScrollView>;
  scrollYRef: RefObject<number>;
  resetKey?: string;
}

export function useCommentaryCollapseScroll({
  scrollViewRef,
  scrollYRef,
  resetKey,
}: UseCommentaryCollapseScrollOptions) {
  const cardLayoutsRef = useRef(new Map<number, CardLayout>());
  const commentaryHeightsRef = useRef(new Map<number, number>());
  const [closingIndex, setClosingIndex] = useState<number | null>(null);

  const active = useSharedValue(0);
  const index = useSharedValue(-1);
  const startHeight = useSharedValue(-1);
  const initialNextY = useSharedValue(0);
  const startScrollY = useSharedValue(0);

  const clearClosingIndex = useCallback(() => {
    setClosingIndex(null);
  }, []);

  useEffect(() => {
    cardLayoutsRef.current.clear();
    commentaryHeightsRef.current.clear();
    active.value = 0;
    index.value = -1;
    setClosingIndex(null);
  }, [resetKey, active, index]);

  const collapseScroll: AccordionCollapseScroll = useMemo(
    () => ({
      scrollViewRef,
      active,
      index,
      startHeight,
      initialNextY,
      startScrollY,
      onEnd: clearClosingIndex,
    }),
    [scrollViewRef, active, index, startHeight, initialNextY, startScrollY, clearClosingIndex],
  );

  const registerCardLayout = useCallback((indexValue: number, y: number, height: number) => {
    cardLayoutsRef.current.set(indexValue, { y, height });
  }, []);

  const registerCommentaryHeight = useCallback((indexValue: number, height: number) => {
    if (height <= 0) {
      return;
    }
    commentaryHeightsRef.current.set(indexValue, height);
  }, []);

  const beginCollapse = useCallback(
    (cardIndex: number, nextIndex: number | null) => {
      const commentaryHeight = commentaryHeightsRef.current.get(cardIndex) ?? 0;
      if (commentaryHeight <= 0) {
        return;
      }

      const nextLayout = nextIndex != null ? cardLayoutsRef.current.get(nextIndex) : undefined;
      const cardLayout = cardLayoutsRef.current.get(cardIndex);
      const nextY = nextLayout
        ? nextLayout.y
        : cardLayout
          ? cardLayout.y + cardLayout.height
          : null;

      if (nextY == null) {
        return;
      }

      const scrollY = scrollYRef.current;
      if (nextY - commentaryHeight >= scrollY) {
        return;
      }

      startHeight.value = -1;
      initialNextY.value = nextY;
      startScrollY.value = scrollY;
      index.value = cardIndex;
      active.value = 1;
      setClosingIndex(cardIndex);
    },
    [active, index, initialNextY, scrollYRef, startHeight, startScrollY],
  );

  return {
    registerCardLayout,
    registerCommentaryHeight,
    beginCollapse,
    collapseScroll,
    closingIndex,
  };
}
