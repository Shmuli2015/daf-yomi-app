import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { addDays, subDays } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { getDateStr } from '../utils/dafYomi';
import { triggerSelection } from '../utils/haptics';

export function useHomeDateNav() {
  const currentDate = useAppStore((s) => s.currentDate);
  const setCurrentDate = useAppStore((s) => s.setCurrentDate);
  const viewingTodayOnBackground = useRef(false);

  const todayStr = getDateStr(new Date());
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
    setCurrentDate(new Date());
  }, [isToday, setCurrentDate]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        const stored = useAppStore.getState().currentDate;
        viewingTodayOnBackground.current = getDateStr(stored) === getDateStr(new Date());
        return;
      }
      if (state !== 'active') return;
      if (!viewingTodayOnBackground.current) return;
      const now = new Date();
      const stored = useAppStore.getState().currentDate;
      if (getDateStr(stored) !== getDateStr(now)) {
        useAppStore.getState().setCurrentDate(now);
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

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
