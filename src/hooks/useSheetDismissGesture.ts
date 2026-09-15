import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  useWindowDimensions,
  type GestureResponderHandlers,
} from 'react-native';

const DISMISS_DISTANCE = 48;
const DISMISS_VELOCITY = 0.45;
const MIN_FLICK_DISTANCE = 12;
const MOVE_ACTIVATE_DISTANCE = 3;

interface UseSheetDismissGestureParams {
  visible: boolean;
  enabled?: boolean;
  onClose: () => void;
}

interface UseSheetDismissGestureResult {
  panHandlers: GestureResponderHandlers;
  sheetAnimatedStyle: { transform: { translateY: Animated.Value }[] };
  overlayAnimatedStyle: { opacity: Animated.Value };
  animationType: 'none' | 'slide';
}

export function useSheetDismissGesture({
  visible,
  enabled = true,
  onClose,
}: UseSheetDismissGestureParams): UseSheetDismissGestureResult {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const [skipExitAnimation, setSkipExitAnimation] = useState(false);
  const closingRef = useRef(false);
  const closeOnceRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paramsRef = useRef({ enabled, onClose, windowHeight });
  paramsRef.current = { enabled, onClose, windowHeight };

  useEffect(() => {
    if (!visible) return;
    closeOnceRef.current = false;
    closingRef.current = false;
    setSkipExitAnimation(false);
    translateY.setValue(0);
    overlayOpacity.setValue(1);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [overlayOpacity, translateY, visible]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const closeFromGesture = useCallback(() => {
    if (closeOnceRef.current) return;
    closeOnceRef.current = true;
    closingRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSkipExitAnimation(true);
    paramsRef.current.onClose();
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          paramsRef.current.enabled && !closingRef.current,
        onMoveShouldSetPanResponder: (_, gs) => {
          if (!paramsRef.current.enabled || closingRef.current) return false;
          return gs.dy > MOVE_ACTIVATE_DISTANCE && gs.dy >= Math.abs(gs.dx);
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderMove: (_, gs) => {
          const dy = Math.max(0, gs.dy);
          translateY.setValue(dy);
          overlayOpacity.setValue(
            Math.max(0.15, 1 - dy / Math.max(paramsRef.current.windowHeight * 0.7, 1)),
          );
        },
        onPanResponderRelease: (_, gs) => {
          const shouldDismiss =
            gs.dy > DISMISS_DISTANCE || (gs.vy > DISMISS_VELOCITY && gs.dy > MIN_FLICK_DISTANCE);
          if (!shouldDismiss) {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: false,
                tension: 80,
                friction: 12,
              }),
              Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: false,
              }),
            ]).start();
            return;
          }
          closingRef.current = true;
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: paramsRef.current.windowHeight,
              duration: 180,
              useNativeDriver: false,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: false,
            }),
          ]).start(() => {
            closeFromGesture();
          });
          closeTimeoutRef.current = setTimeout(() => {
            closeFromGesture();
          }, 220);
        },
        onPanResponderTerminate: () => {
          if (closingRef.current) return;
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
              tension: 80,
              friction: 12,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 180,
              useNativeDriver: false,
            }),
          ]).start();
        },
      }),
    [closeFromGesture, overlayOpacity, translateY],
  );

  return {
    panHandlers: enabled ? panResponder.panHandlers : {},
    sheetAnimatedStyle: { transform: [{ translateY }] },
    overlayAnimatedStyle: { opacity: overlayOpacity },
    animationType: skipExitAnimation ? 'none' : 'slide',
  };
}
