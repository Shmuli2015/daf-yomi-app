import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useGuideSectionAnimation(isExpanded: boolean) {
  const chevronProgress = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    chevronProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 250 });
  }, [isExpanded, chevronProgress]);

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${chevronProgress.value * 180}deg` }],
    };
  });

  return {
    animatedChevronStyle,
  };
}
