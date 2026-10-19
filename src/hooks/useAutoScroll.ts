import { useEffect, useRef } from 'react';
import type { ScrollView } from 'react-native';

export type AutoScrollSpeedLevel = 1 | 2 | 3 | 4 | 5;

const SPEED_LEVEL_MAP: Record<AutoScrollSpeedLevel, number> = {
  1: 0.5,
  2: 0.9,
  3: 1.4,
  4: 2.1,
  5: 3.2,
};

interface UseAutoScrollOptions {
  scrollViewRef: React.RefObject<ScrollView | null>;
  scrollYRef: React.MutableRefObject<number>;
  active: boolean;
  level: AutoScrollSpeedLevel;
  isPaused: boolean;
  maxScrollRef: React.MutableRefObject<number>;
  onReachEnd?: () => void;
}

export function useAutoScroll({
  scrollViewRef,
  scrollYRef,
  active,
  level,
  isPaused,
  maxScrollRef,
  onReachEnd,
}: UseAutoScrollOptions) {
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || isPaused) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const stepPerFrame = SPEED_LEVEL_MAP[level] || 1.4;

    const tick = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaMs = time - lastTimeRef.current;
      if (deltaMs >= 14) {
        const factor = Math.min(3, deltaMs / 16.6);
        const maxScroll = maxScrollRef.current;
        const currentY = scrollYRef.current;

        if (maxScroll > 0 && currentY >= maxScroll - 1) {
          onReachEnd?.();
          return;
        }

        const nextY = Math.min(
          maxScroll > 0 ? maxScroll : Infinity,
          currentY + stepPerFrame * factor,
        );
        scrollYRef.current = nextY;
        scrollViewRef.current?.scrollTo({ y: nextY, animated: false });
        lastTimeRef.current = time;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [active, isPaused, level, scrollViewRef, scrollYRef, maxScrollRef, onReachEnd]);
}
