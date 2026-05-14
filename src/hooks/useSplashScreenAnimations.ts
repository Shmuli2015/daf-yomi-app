import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useSplashScreenAnimations(isReady: boolean, onFinish: () => void) {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, damping: 10, stiffness: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.timing(dividerScale, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
    ]).start(() => {
      shimmerLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1.06, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      shimmerLoopRef.current.start();
    });
  }, [scale, iconScale, opacity, subtitleOpacity, dividerScale, shimmer]);

  useEffect(() => {
    if (isReady) {
      shimmerLoopRef.current?.stop();
      Animated.timing(shimmer, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }).start(() => onFinish());
    }
  }, [isReady, onFinish, shimmer, containerOpacity]);

  return {
    scale,
    opacity,
    containerOpacity,
    shimmer,
    iconScale,
    subtitleOpacity,
    dividerScale,
  };
}
