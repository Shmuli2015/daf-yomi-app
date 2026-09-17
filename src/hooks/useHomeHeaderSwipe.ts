import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface UseHomeHeaderSwipeParams {
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onTodayPress?: () => void;
  isToday?: boolean;
  currentDate?: Date;
  masechetProgressPct?: number;
}

export function useHomeHeaderSwipe({
  onPrevDay,
  onNextDay,
  onTodayPress,
  isToday,
  currentDate,
  masechetProgressPct = 0,
}: UseHomeHeaderSwipeParams) {
  const progressWidth = useSharedValue(0);
  const todayJumpX = useSharedValue(0);
  const todayJumpOpacity = useSharedValue(1);
  const todayBtnScale = useSharedValue(1);
  const swipeTranslateX = useSharedValue(0);
  const swipeOpacity = useSharedValue(1);
  const onPrevDayRef = useRef(onPrevDay);
  const onNextDayRef = useRef(onNextDay);
  const onTodayPressRef = useRef(onTodayPress);
  const isTodayRef = useRef(isToday);
  const currentDateRef = useRef(currentDate);
  const isAnimatingRef = useRef(false);

  onPrevDayRef.current = onPrevDay;
  onNextDayRef.current = onNextDay;
  onTodayPressRef.current = onTodayPress;
  isTodayRef.current = isToday;
  currentDateRef.current = currentDate;

  const SWIPE_THRESHOLD = 50;
  const SLIDE_PX = 28;

  const finishSwipe = useCallback(() => {
    isAnimatingRef.current = false;
  }, []);

  const changeDay = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      onPrevDayRef.current?.();
    } else {
      onNextDayRef.current?.();
    }
  }, []);

  const triggerSwipe = useCallback(
    (direction: 'prev' | 'next') => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const out = direction === 'prev' ? -SLIDE_PX : SLIDE_PX;
      const inn = direction === 'prev' ? SLIDE_PX : -SLIDE_PX;

      swipeOpacity.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.cubic) });
      swipeTranslateX.value = withTiming(
        out,
        { duration: 100, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (!finished) {
            swipeTranslateX.value = withSpring(0, { damping: 20, stiffness: 260 });
            swipeOpacity.value = withTiming(1, { duration: 120 });
            runOnJS(finishSwipe)();
            return;
          }
          swipeTranslateX.value = inn;
          runOnJS(changeDay)(direction);
          swipeOpacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
          swipeTranslateX.value = withTiming(
            0,
            { duration: 180, easing: Easing.out(Easing.cubic) },
            (done) => {
              runOnJS(finishSwipe)();
              if (!done) {
                swipeTranslateX.value = 0;
                swipeOpacity.value = 1;
              }
            },
          );
        },
      );
    },
    [changeDay, finishSwipe, swipeOpacity, swipeTranslateX],
  );

  const triggerSwipeRef = useRef(triggerSwipe);
  triggerSwipeRef.current = triggerSwipe;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          !isAnimatingRef.current &&
          Math.abs(gs.dx) > 10 &&
          Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderMove: (_, gs) => {
          swipeTranslateX.value = gs.dx * 0.15;
        },
        onPanResponderRelease: (_, gs) => {
          if (gs.dx < -SWIPE_THRESHOLD) {
            triggerSwipeRef.current('prev');
          } else if (gs.dx > SWIPE_THRESHOLD) {
            triggerSwipeRef.current('next');
          } else {
            swipeTranslateX.value = withSpring(0, { damping: 20, stiffness: 260 });
          }
        },
        onPanResponderTerminate: () => {
          swipeTranslateX.value = withSpring(0, { damping: 20, stiffness: 260 });
        },
      }),
    [swipeTranslateX],
  );

  useEffect(() => {
    progressWidth.value = withTiming(masechetProgressPct, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
  }, [masechetProgressPct, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedSwipeTranslateStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeTranslateX.value }],
  }));

  const animatedSwipeOpacityStyle = useAnimatedStyle(() => ({
    opacity: swipeOpacity.value,
  }));

  const animatedTodayJumpTranslateStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: todayJumpX.value }],
  }));

  const animatedTodayJumpOpacityStyle = useAnimatedStyle(() => ({
    opacity: todayJumpOpacity.value,
  }));

  const animatedTodayBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: todayBtnScale.value }],
  }));

  const handlePrevDay = useCallback(() => {
    triggerSwipe('prev');
  }, [triggerSwipe]);

  const handleNextDay = useCallback(() => {
    triggerSwipe('next');
  }, [triggerSwipe]);

  const handleTodayPress = useCallback(() => {
    if (!onTodayPressRef.current || isTodayRef.current) return;

    todayBtnScale.value = withSequence(
      withTiming(0.9, { duration: 80, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewing = new Date(currentDateRef.current ?? today);
    viewing.setHours(0, 0, 0, 0);
    const slideFrom = viewing < today ? -18 : 18;

    todayJumpX.value = slideFrom;
    todayJumpOpacity.value = 0.55;
    todayJumpX.value = withSpring(0, { damping: 16, stiffness: 180 });
    todayJumpOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });

    onTodayPressRef.current();
  }, [todayBtnScale, todayJumpOpacity, todayJumpX]);

  return {
    panResponder,
    animatedProgressStyle,
    animatedSwipeTranslateStyle,
    animatedSwipeOpacityStyle,
    animatedTodayJumpTranslateStyle,
    animatedTodayJumpOpacityStyle,
    animatedTodayBtnStyle,
    handleTodayPress,
    handlePrevDay,
    handleNextDay,
  };
}
