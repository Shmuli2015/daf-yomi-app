import { useDerivedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useGuideSectionAnimation(isExpanded: boolean) {
  const chevronProgress = useDerivedValue(() => {
    return withTiming(isExpanded ? 1 : 0, { duration: 250 });
  }, [isExpanded]);

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${chevronProgress.value * 180}deg` }],
    };
  });

  return {
    animatedChevronStyle,
  };
}
