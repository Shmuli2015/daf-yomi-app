import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { addDays, subDays } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { getDafDayDate, getNextDafDayBoundaryAt } from '../utils/dafDayBoundary';
import { getDateStr } from '../utils/dafYomi';
import { triggerSelection } from '../utils/haptics';

function resolveDafToday(now = new Date()) {
  const settings = useAppStore.getState().settings;
  return getDafDayDate(now, settings ?? {});
}

export function useHomeDateNav() {
  const currentDate = useAppStore((s) => s.currentDate);
  const setCurrentDate = useAppStore((s) => s.setCurrentDate);
  const dafDayStartMode = useAppStore((s) => s.settings?.daf_day_start_mode);
  const dafDayStartHour = useAppStore((s) => s.settings?.daf_day_start_hour);
  const dafDayStartMinute = useAppStore((s) => s.settings?.daf_day_start_minute);
  const dafDayStartSchedules = useAppStore((s) => s.settings?.daf_day_start_schedules);
  const viewingTodayOnBackground = useRef(false);
  const rolloverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayStr = getDateStr(resolveDafToday());
  const currentDateStr = getDateStr(currentDate);
  const isToday = currentDateStr === todayStr;
  const isFuture = currentDateStr > todayStr;

  const handlePrevDay = useCallback(() => {
    void triggerSelection();
    setCurrentDate(subDays(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const handleNextDay = useCallback(() => {
    void triggerSelection();
    setCurrentDate(addDays(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const handleTodayPress = useCallback(() => {
    if (isToday) return;
    void triggerSelection();
    setCurrentDate(resolveDafToday());
  }, [isToday, setCurrentDate]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        const stored = useAppStore.getState().currentDate;
        viewingTodayOnBackground.current =
          getDateStr(stored) === getDateStr(resolveDafToday());
        return;
      }
      if (state !== 'active') return;
      if (!viewingTodayOnBackground.current) return;
      const dafToday = resolveDafToday();
      const stored = useAppStore.getState().currentDate;
      if (getDateStr(stored) !== getDateStr(dafToday)) {
        useAppStore.getState().setCurrentDate(dafToday);
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const clearTimer = () => {
      if (rolloverTimerRef.current !== null) {
        clearTimeout(rolloverTimerRef.current);
        rolloverTimerRef.current = null;
      }
    };

    const scheduleNext = () => {
      clearTimer();
      const settings = useAppStore.getState().settings ?? {};
      const now = new Date();
      const dafTodayWhenScheduled = getDateStr(getDafDayDate(now, settings));
      const nextAt = getNextDafDayBoundaryAt(now, settings);
      const delayMs = Math.max(nextAt.getTime() - now.getTime(), 0) + 50;
      const cappedDelay = Math.min(delayMs, 2147483647);

      rolloverTimerRef.current = setTimeout(() => {
        const state = useAppStore.getState();
        if (getDateStr(state.currentDate) === dafTodayWhenScheduled) {
          state.setCurrentDate(getDafDayDate(new Date(), state.settings ?? {}));
        }
        scheduleNext();
      }, cappedDelay);
    };

    scheduleNext();
    return clearTimer;
  }, [dafDayStartMode, dafDayStartHour, dafDayStartMinute, dafDayStartSchedules]);

  return {
    currentDate,
    currentDateStr,
    todayStr,
    isToday,
    isFuture,
    handlePrevDay,
    handleNextDay,
    handleTodayPress,
  };
}
