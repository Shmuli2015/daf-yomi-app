import { useCallback, useRef } from 'react';

export function useReaderScrollMemory(pageKey: string) {
  const offsetsRef = useRef(new Map<string, number>());
  const pageKeyRef = useRef(pageKey);

  if (pageKeyRef.current !== pageKey) {
    offsetsRef.current = new Map();
    pageKeyRef.current = pageKey;
  }

  const getOffset = useCallback((mode: string) => offsetsRef.current.get(mode) ?? 0, []);

  const setOffset = useCallback((mode: string, offset: number) => {
    offsetsRef.current.set(mode, offset);
  }, []);

  return { getOffset, setOffset };
}
