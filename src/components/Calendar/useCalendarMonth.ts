import { useState, useMemo, useRef, useCallback } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';
import { HDate, Locale } from '@hebcal/core';
import { getStudyStatus } from '../../utils/dafStatus';
import { getDafByDate, getDateStr } from '../../utils/dafYomi';
import { getHebrewDayEventInfo } from '../../utils/hebrewCalendarEvents';
import { getMonthTractates, formatMonthTractatesSummary, formatMonthTractatesShort } from '../../utils/monthTractates';

export interface DayData {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  partial: boolean;
  isToday: boolean;
  dateKey: string;
  dafLabel?: string;
  hasSpecialEvent?: boolean;
}

export function isSameDay(d1: HDate, d2: HDate | null): boolean {
  if (!d2) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

interface UseCalendarMonthProps {
  recordByDate: Map<string, any>;
  showCalendarDaf: boolean;
}

const SLIDE_PX = 40;

export function useCalendarMonth({ recordByDate, showCalendarDaf }: UseCalendarMonthProps) {
  const [currentHDate, setCurrentHDate] = useState(() => new HDate(new Date()));

  const gridTranslateX = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(1)).current;

  const animateGridChange = useCallback((direction: 'next' | 'prev', changeFn: () => void) => {
    const outDir = direction === 'next' ? SLIDE_PX : -SLIDE_PX;
    const enterFrom = direction === 'next' ? -SLIDE_PX : SLIDE_PX;

    Animated.parallel([
      Animated.timing(gridOpacity, { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(gridTranslateX, { toValue: outDir, duration: 170, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      changeFn();
      gridTranslateX.setValue(enterFrom);
      Animated.parallel([
        Animated.timing(gridOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(gridTranslateX, { toValue: 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });
  }, [gridOpacity, gridTranslateX]);

  const goNextMonth = useCallback(() => {
    animateGridChange('next', () => {
      const daysInMonth = HDate.daysInMonth(currentHDate.getMonth(), currentHDate.getFullYear());
      const next = new HDate(daysInMonth, currentHDate.getMonth(), currentHDate.getFullYear()).next();
      setCurrentHDate(new HDate(1, next.getMonth(), next.getFullYear()));
    });
  }, [animateGridChange, currentHDate]);

  const goPrevMonth = useCallback(() => {
    animateGridChange('prev', () => {
      const prev = new HDate(1, currentHDate.getMonth(), currentHDate.getFullYear()).prev();
      setCurrentHDate(new HDate(1, prev.getMonth(), prev.getFullYear()));
    });
  }, [animateGridChange, currentHDate]);

  const goToToday = useCallback(() => {
    const today = new HDate(new Date());
    if (currentHDate.getMonth() === today.getMonth() && currentHDate.getFullYear() === today.getFullYear()) return;

    const direction = (today.getFullYear() > currentHDate.getFullYear() || 
                      (today.getFullYear() === currentHDate.getFullYear() && today.getMonth() > currentHDate.getMonth())) 
                      ? 'next' : 'prev';
    
    animateGridChange(direction, () => {
      setCurrentHDate(today);
    });
  }, [animateGridChange, currentHDate]);

  const swipeHandlers = useRef({ goNextMonth, goPrevMonth });
  swipeHandlers.current = { goNextMonth, goPrevMonth };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          swipeHandlers.current.goNextMonth();
        } else if (gestureState.dx < -50) {
          swipeHandlers.current.goPrevMonth();
        }
      },
    })
  ).current;

  const calendarData = useMemo(() => {
    const year = currentHDate.getFullYear();
    const month = currentHDate.getMonth();
    const firstDayOfMonth = new HDate(1, month, year);
    const dayOfWeek = firstDayOfMonth.getDay();
    const days: DayData[] = [];

    const todayHd = new HDate(new Date());
    const prevMonth = firstDayOfMonth.prev();
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = new HDate(prevMonth.getDate() - i, prevMonth.getMonth(), prevMonth.getFullYear());
      const dateKey = getDateStr(d.greg());
      const record = recordByDate.get(dateKey);
      const studyStatus = getStudyStatus(record);
      const evt = getHebrewDayEventInfo(d);
      days.push({
        hdate: d,
        isCurrentMonth: false,
        learned: studyStatus === 'learned',
        partial: studyStatus === 'partial',
        isToday: isSameDay(d, todayHd),
        dateKey,
        dafLabel: showCalendarDaf ? getDafByDate(d.greg()).dafNumOnly || undefined : undefined,
        hasSpecialEvent: evt.isShabbat || evt.isRoshChodesh || evt.isHoliday,
      });
    }

    let d = firstDayOfMonth;
    while (d.getMonth() === month) {
      const dateKey = getDateStr(d.greg());
      const record = recordByDate.get(dateKey);
      const studyStatus = getStudyStatus(record);
      const evt = getHebrewDayEventInfo(d);
      days.push({
        hdate: d,
        isCurrentMonth: true,
        learned: studyStatus === 'learned',
        partial: studyStatus === 'partial',
        isToday: isSameDay(d, todayHd),
        dateKey,
        dafLabel: showCalendarDaf ? getDafByDate(d.greg()).dafNumOnly || undefined : undefined,
        hasSpecialEvent: evt.isShabbat || evt.isRoshChodesh || evt.isHoliday,
      });
      d = d.next();
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const dateKey = getDateStr(d.greg());
      const record = recordByDate.get(dateKey);
      const studyStatus = getStudyStatus(record);
      const evt = getHebrewDayEventInfo(d);
      days.push({
        hdate: d,
        isCurrentMonth: false,
        learned: studyStatus === 'learned',
        partial: studyStatus === 'partial',
        isToday: isSameDay(d, new HDate()),
        dateKey,
        dafLabel: showCalendarDaf ? getDafByDate(d.greg()).dafNumOnly || undefined : undefined,
        hasSpecialEvent: evt.isShabbat || evt.isRoshChodesh || evt.isHoliday,
      });
      d = d.next();
    }
    return days;
  }, [currentHDate, recordByDate, showCalendarDaf]);

  const monthName = useMemo(() => {
    return Locale.gettext(HDate.getMonthName(currentHDate.getMonth(), currentHDate.getFullYear()), 'he').replace(/[\u0591-\u05C7]/g, '');
  }, [currentHDate]);

  const yearName = useMemo(() => {
    return currentHDate.renderGematriya().split(' ').pop();
  }, [currentHDate]);

  const isViewingTodayMonth = useMemo(() => {
    const today = new HDate(new Date());
    return (
      currentHDate.getMonth() === today.getMonth() && currentHDate.getFullYear() === today.getFullYear()
    );
  }, [currentHDate]);

  const monthlyStats = useMemo(() => {
    const currentMonthDays = calendarData.filter((d) => d.isCurrentMonth);
    const totalCount = currentMonthDays.length;
    const learnedCount = currentMonthDays.filter((d) => d.learned).length;
    return { totalCount, learnedCount };
  }, [calendarData]);

  const monthTractateSpans = useMemo(() => {
    return getMonthTractates(currentHDate.getMonth(), currentHDate.getFullYear());
  }, [currentHDate]);

  const monthTractateSummary = useMemo(() => {
    return formatMonthTractatesSummary(monthTractateSpans);
  }, [monthTractateSpans]);

  const monthTractateShort = useMemo(() => {
    return formatMonthTractatesShort(monthTractateSpans);
  }, [monthTractateSpans]);

  return {
    currentHDate,
    setCurrentHDate,
    calendarData,
    monthlyStats,
    monthName,
    yearName,
    isViewingTodayMonth,
    monthTractateSummary,
    monthTractateShort,
    gridTranslateX,
    gridOpacity,
    panResponder,
    goNextMonth,
    goPrevMonth,
    goToToday,
    animateGridChange,
  };
}
