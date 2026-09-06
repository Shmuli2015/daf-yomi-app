import { useMemo, useEffect } from 'react';
import { PanResponder } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface UseHomeHeaderSwipeParams {
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onTodayPress?: () => void;
  isToday?: boolean;
  currentDate?: Date;
  masechetProgressPct?: number;
  isMarked?: boolean;
}

export function useHomeHeaderSwipe({
  onPrevDay,
  onNextDay,
  onTodayPress,
  isToday,
  currentDate,
  masechetProgressPct = 0,
  isMarked,
}: UseHomeHeaderSwipeParams) {
  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const todayJumpX = useSharedValue(0);
  const todayJumpOpacity = useSharedValue(1);
  const todayBtnScale = useSharedValue(1);
  const swipeTranslateX = useSharedValue(0);

  const SWIPE_THRESHOLD = 50;

  const triggerSwipe = (direction: 'prev' | 'next') => {
    const slideOut = direction === 'prev' ? -12 : 12;
    const slideIn = direction === 'prev' ? 12 : -12;

    swipeTranslateX.value = withTiming(
      slideOut,
      { duration: 110, easing: Easing.out(Easing.ease) },
      () => {
        swipeTranslateX.value = slideIn;
        swipeTranslateX.value = withTiming(0, { duration: 170, easing: Easing.out(Easing.cubic) });
      },
    );
    if (direction === 'prev') {
      onPrevDay?.();
    } else {
      onNextDay?.();
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderMove: (_, gs) => {
          swipeTranslateX.value = gs.dx * 0.15;
        },
        onPanResponderRelease: (_, gs) => {
          if (gs.dx < -SWIPE_THRESHOLD) {
            triggerSwipe('prev');
          } else if (gs.dx > SWIPE_THRESHOLD) {
            triggerSwipe('next');
          } else {
            swipeTranslateX.value = withSpring(0, { damping: 20, stiffness: 260 });
          }
        },
        onPanResponderTerminate: () => {
          swipeTranslateX.value = withSpring(0, { damping: 20, stiffness: 260 });
        },
      }),
    [onPrevDay, onNextDay],
  );

  useEffect(() => {
    progressWidth.value = withTiming(masechetProgressPct, { duration: 1000, easing: Easing.out(Easing.exp) });
    pulseScale.value = withSpring(1);
  }, [masechetProgressPct, isMarked]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeTranslateX.value }],
  }));

  const animatedTodayJumpStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: todayJumpX.value }],
    opacity: todayJumpOpacity.value,
  }));

  const animatedTodayBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: todayBtnScale.value }],
  }));

  const handleTodayPress = () => {
    if (!onTodayPress) return;

    if (isToday) {
      onTodayPress();
      return;
    }

    todayBtnScale.value = withSequence(
      withTiming(0.9, { duration: 80, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewing = new Date(currentDate ?? today);
    viewing.setHours(0, 0, 0, 0);
    const slideFrom = viewing < today ? -18 : 18;

    todayJumpX.value = slideFrom;
    todayJumpOpacity.value = 0.55;
    todayJumpX.value = withSpring(0, { damping: 16, stiffness: 180 });
    todayJumpOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });

    onTodayPress();
  };

  return {
    panResponder,
    animatedProgressStyle,
    animatedButtonStyle,
    animatedSwipeStyle,
    animatedTodayJumpStyle,
    animatedTodayBtnStyle,
    handleTodayPress,
  };
}
