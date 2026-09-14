import { useRef } from 'react';
import { PanResponder, type GestureResponderHandlers } from 'react-native';
import { triggerImpact } from '../utils/haptics';

interface UseDafSwipeGestureParams {
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  canSwipeNext: boolean;
  canSwipePrev: boolean;
  enabled?: boolean;
}

export function useDafSwipeGesture({
  onSwipeNext,
  onSwipePrev,
  canSwipeNext,
  canSwipePrev,
  enabled = true,
}: UseDafSwipeGestureParams): GestureResponderHandlers {
  const paramsRef = useRef({
    onSwipeNext,
    onSwipePrev,
    canSwipeNext,
    canSwipePrev,
    enabled,
  });

  paramsRef.current = {
    onSwipeNext,
    onSwipePrev,
    canSwipeNext,
    canSwipePrev,
    enabled,
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!paramsRef.current.enabled) return false;
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onPanResponderRelease: (_, gestureState) => {
        const current = paramsRef.current;
        if (!current.enabled) return;
        const { dx, dy } = gestureState;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx > 0 && current.canSwipeNext) {
            void triggerImpact('light');
            current.onSwipeNext();
          } else if (dx < 0 && current.canSwipePrev) {
            void triggerImpact('light');
            current.onSwipePrev();
          }
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
