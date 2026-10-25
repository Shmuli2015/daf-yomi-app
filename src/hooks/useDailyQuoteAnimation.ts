import { useCallback } from 'react';
import { scheduleOnRN } from 'react-native-worklets';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

export function useDailyQuoteAnimation() {
  const quoteOpacity = useSharedValue(1);
  const quoteTranslateY = useSharedValue(0);
  const shuffleRotation = useSharedValue(0);

  const animatedQuoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteTranslateY.value }],
  }));

  const animatedDiceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shuffleRotation.value}deg` }],
  }));

  const animateQuoteChange = useCallback((onUpdate: () => void) => {
    shuffleRotation.value = withTiming(shuffleRotation.value + 360, {
      duration: 400,
    });

    quoteOpacity.value = withTiming(0, { duration: 120 }, (finished) => {
      if (finished) {
        scheduleOnRN(() => {
          onUpdate();
          quoteTranslateY.value = 8;
          quoteOpacity.value = withTiming(1, { duration: 220 });
          quoteTranslateY.value = withSpring(0, { damping: 14, stiffness: 120 });
        });
      }
    });
  }, [quoteOpacity, quoteTranslateY, shuffleRotation]);

  return {
    animatedQuoteStyle,
    animatedDiceStyle,
    animateQuoteChange,
  };
}
