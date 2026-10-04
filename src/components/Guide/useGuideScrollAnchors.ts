import { useCallback, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export function useGuideScrollAnchors() {
  const containerOffsetRef = useRef(0);
  const anchorOffsetsRef = useRef<Record<string, number>>({});

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    containerOffsetRef.current = event.nativeEvent.layout.y;
  }, []);

  const registerAnchor = useCallback((id: string, event: LayoutChangeEvent) => {
    anchorOffsetsRef.current[id] = event.nativeEvent.layout.y;
  }, []);

  const getAnchorOffset = useCallback((id: string): number | null => {
    const anchorOffset = anchorOffsetsRef.current[id];
    if (anchorOffset === undefined) return null;
    return containerOffsetRef.current + anchorOffset;
  }, []);

  return { onContainerLayout, registerAnchor, getAnchorOffset };
}
