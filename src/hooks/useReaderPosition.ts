import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import { AppState, type ScrollViewInstance } from 'react-native';
import { clearReaderPosition, getReaderPosition, saveReaderPosition } from '../db/database';
import { captureException } from '../services/sentry';
import { RESTORE_TOP_PADDING_PX, findTopAnchorIndex } from '../utils/readerPositionAnchors';
import { scrollReaderTo } from '../utils/readerScroll';

interface UseReaderPositionOptions {
  positionKey?: string;
  scrollViewRef: { current: Pick<ScrollViewInstance, 'scrollTo'> | null };
  scrollYRef: MutableRefObject<number>;
  skipRestore?: boolean;
  scrollToIndex?: (index: number) => void;
}

export function useReaderPosition({
  positionKey,
  scrollViewRef,
  scrollYRef,
  skipRestore = false,
  scrollToIndex,
}: UseReaderPositionOptions) {
  const anchorsRef = useRef(new Map<number, number>());
  const visibleIndexRef = useRef<number | null>(null);
  const pendingRestoreRef = useRef<number | null>(null);
  const positionKeyRef = useRef(positionKey);
  const skipRestoreRef = useRef(skipRestore);
  const scrollToIndexRef = useRef(scrollToIndex);
  positionKeyRef.current = positionKey;
  skipRestoreRef.current = skipRestore;
  scrollToIndexRef.current = scrollToIndex;

  const persist = useCallback(
    (key: string | undefined) => {
      if (!key) return;
      try {
        if (visibleIndexRef.current != null) {
          if (visibleIndexRef.current <= 0) {
            clearReaderPosition(key);
          } else {
            saveReaderPosition(key, visibleIndexRef.current);
          }
          return;
        }
        if (anchorsRef.current.size === 0) return;
        const topIndex = findTopAnchorIndex(anchorsRef.current, scrollYRef.current);
        if (topIndex === null) {
          clearReaderPosition(key);
        } else {
          saveReaderPosition(key, topIndex);
        }
      } catch (error) {
        captureException(error);
      }
    },
    [scrollYRef],
  );

  useEffect(() => {
    anchorsRef.current = new Map();
    visibleIndexRef.current = null;
    pendingRestoreRef.current = null;
    let restoreTimer: ReturnType<typeof setTimeout> | null = null;
    if (positionKey && !skipRestoreRef.current) {
      try {
        const saved = getReaderPosition(positionKey);
        pendingRestoreRef.current = saved;
        if (saved != null && saved > 0 && scrollToIndexRef.current) {
          restoreTimer = setTimeout(() => {
            scrollToIndexRef.current?.(saved);
            pendingRestoreRef.current = null;
          }, 0);
        }
      } catch (error) {
        captureException(error);
      }
    }
    return () => {
      if (restoreTimer) {
        clearTimeout(restoreTimer);
      }
      persist(positionKey);
    };
  }, [positionKey, persist]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        persist(positionKeyRef.current);
      }
    });
    return () => subscription.remove();
  }, [persist]);

  const registerAnchor = useCallback(
    (index: number, y: number) => {
      anchorsRef.current.set(index, y);
      if (pendingRestoreRef.current === index) {
        pendingRestoreRef.current = null;
        scrollReaderTo(
          scrollViewRef.current,
          Math.max(0, y - RESTORE_TOP_PADDING_PX),
          false,
        );
      }
    },
    [scrollViewRef],
  );

  const reportVisibleIndex = useCallback((index: number) => {
    visibleIndexRef.current = index;
  }, []);

  const clearSavedPosition = useCallback(() => {
    pendingRestoreRef.current = null;
    const key = positionKeyRef.current;
    if (!key) return;
    try {
      clearReaderPosition(key);
    } catch (error) {
      captureException(error);
    }
  }, []);

  return { registerAnchor, clearSavedPosition, reportVisibleIndex };
}
