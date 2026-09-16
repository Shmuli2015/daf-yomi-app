import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  PanResponder,
  useWindowDimensions,
  type GestureResponderHandlers,
} from 'react-native';

const DISMISS_DISTANCE = 48;
const DISMISS_VELOCITY = 0.45;
const MIN_FLICK_DISTANCE = 12;
const MOVE_ACTIVATE_DISTANCE = 3;
const ENTER_DURATION = 280;
const EXIT_DURATION = 180;
const EXIT_FALLBACK_MS = 220;

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
  dismiss: () => void;
}

export function useSheetDismissGesture({
  visible,
  enabled = true,
  onClose,
}: UseSheetDismissGestureParams): UseSheetDismissGestureResult {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);
  const closeOnceRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasVisibleRef = useRef(visible);
  const enterAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const paramsRef = useRef({ enabled, onClose, windowHeight });
  paramsRef.current = { enabled, onClose, windowHeight };

  if (visible && !wasVisibleRef.current) {
    closingRef.current = false;
    closeOnceRef.current = false;
    translateY.setValue(Math.max(windowHeight, 1));
    overlayOpacity.setValue(0);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }
  wasVisibleRef.current = visible;

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }
    enterAnimRef.current?.stop();
    const enter = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    enterAnimRef.current = enter;
    enter.start();
    return () => {
      enter.stop();
    };
  }, [overlayOpacity, translateY, visible]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const finishClose = useCallback(() => {
    if (closeOnceRef.current) return;
    closeOnceRef.current = true;
    closingRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    paramsRef.current.onClose();
  }, []);

  const runExitAnimation = useCallback(
    (onDone: () => void) => {
      Keyboard.dismiss();
      enterAnimRef.current?.stop();
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: paramsRef.current.windowHeight,
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDone();
      });
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      closeTimeoutRef.current = setTimeout(() => {
        onDone();
      }, EXIT_FALLBACK_MS);
    },
    [overlayOpacity, translateY],
  );

  const dismiss = useCallback(() => {
    if (closingRef.current || closeOnceRef.current) return;
    closingRef.current = true;
    runExitAnimation(finishClose);
  }, [finishClose, runExitAnimation]);

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
                useNativeDriver: true,
                tension: 80,
                friction: 12,
              }),
              Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: EXIT_DURATION,
                useNativeDriver: true,
              }),
            ]).start();
            return;
          }
          closingRef.current = true;
          runExitAnimation(finishClose);
        },
        onPanResponderTerminate: () => {
          if (closingRef.current) return;
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 80,
              friction: 12,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: EXIT_DURATION,
              useNativeDriver: true,
            }),
          ]).start();
        },
      }),
    [finishClose, overlayOpacity, runExitAnimation, translateY],
  );

  return {
    panHandlers: enabled ? panResponder.panHandlers : {},
    sheetAnimatedStyle: { transform: [{ translateY }] },
    overlayAnimatedStyle: { opacity: overlayOpacity },
    animationType: 'none',
    dismiss,
  };
}
