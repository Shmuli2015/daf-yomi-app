import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import { AppState, type ScrollView } from 'react-native';
import { clearReaderPosition, getReaderPosition, saveReaderPosition } from '../db/database';
import { captureException } from '../services/sentry';
import { RESTORE_TOP_PADDING_PX, findTopAnchorIndex } from '../utils/readerPositionAnchors';

interface UseReaderPositionOptions {
  positionKey?: string;
  scrollViewRef: { current: Pick<ScrollView, 'scrollTo'> | null };
  scrollYRef: MutableRefObject<number>;
  skipRestore?: boolean;
}

export function useReaderPosition({
  positionKey,
  scrollViewRef,
  scrollYRef,
  skipRestore = false,
}: UseReaderPositionOptions) {
  const anchorsRef = useRef(new Map<number, number>());
  const pendingRestoreRef = useRef<number | null>(null);
  const positionKeyRef = useRef(positionKey);
  const skipRestoreRef = useRef(skipRestore);
  positionKeyRef.current = positionKey;
  skipRestoreRef.current = skipRestore;

  const persist = useCallback(
    (key: string | undefined) => {
      if (!key || anchorsRef.current.size === 0) return;
      try {
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
    pendingRestoreRef.current = null;
    if (positionKey && !skipRestoreRef.current) {
      try {
        pendingRestoreRef.current = getReaderPosition(positionKey);
      } catch (error) {
        captureException(error);
      }
    }
    return () => persist(positionKey);
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
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - RESTORE_TOP_PADDING_PX),
          animated: false,
        });
      }
    },
    [scrollViewRef],
  );

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

  return { registerAnchor, clearSavedPosition };
}
