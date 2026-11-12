import { useCallback, useEffect, useRef } from 'react';
import { scheduleOnRN } from 'react-native-worklets';
import {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useAccessibilityInfo } from './useAccessibilityInfo';

const ENTRANCE_DURATION_MS = 450;
const ENTRANCE_OFFSET = 12;

export function useDailyQuoteAnimation() {
  const { reduceMotionEnabled, reduceMotionReady } = useAccessibilityInfo();
  const quoteOpacity = useSharedValue(1);
  const quoteTranslateY = useSharedValue(0);
  const shuffleRotation = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(ENTRANCE_OFFSET);
  const entranceSettled = useRef(false);
  const pendingUpdateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!reduceMotionReady && !reduceMotionEnabled) return;

    if (reduceMotionEnabled) {
      cardOpacity.value = 1;
      cardTranslateY.value = 0;
      entranceSettled.current = true;
      return;
    }

    if (entranceSettled.current) return;
    entranceSettled.current = true;

    cardOpacity.value = withTiming(1, {
      duration: ENTRANCE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    cardTranslateY.value = withTiming(0, {
      duration: ENTRANCE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [reduceMotionEnabled, reduceMotionReady, cardOpacity, cardTranslateY]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const animatedQuoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteTranslateY.value }],
  }));

  const animatedDiceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shuffleRotation.value}deg` }],
  }));

  const revealNextQuote = useCallback(() => {
    pendingUpdateRef.current?.();
    quoteTranslateY.value = 8;
    quoteOpacity.value = withTiming(1, { duration: 220 });
    quoteTranslateY.value = withSpring(0, { damping: 14, stiffness: 120 });
  }, [quoteOpacity, quoteTranslateY]);

  const animateQuoteChange = useCallback((onUpdate: () => void) => {
    pendingUpdateRef.current = onUpdate;
    shuffleRotation.value = withTiming(shuffleRotation.value + 360, {
      duration: 400,
    });

    quoteOpacity.value = withTiming(0, { duration: 120 }, (finished) => {
      if (finished) {
        scheduleOnRN(revealNextQuote);
      }
    });
  }, [quoteOpacity, shuffleRotation, revealNextQuote]);

  return {
    animatedCardStyle,
    animatedQuoteStyle,
    animatedDiceStyle,
    animateQuoteChange,
  };
}
