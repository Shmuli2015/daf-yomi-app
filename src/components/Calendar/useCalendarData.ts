import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function useCalendarData() {
  const history = useAppStore((s) => s.history);
  const showCalendarDaf = useAppStore((s) => s.settings?.show_calendar_daf === 1);
  const showConfetti = useAppStore((s) => s.settings?.show_confetti === 1);

  const recordByDate = useMemo(() => {
    const map = new Map<string, (typeof history)[0]>();
    for (let i = 0; i < history.length; i++) {
      const r = history[i];
      map.set(r.date, r);
    }
    return map;
  }, [history]);

  return {
    recordByDate,
    showCalendarDaf,
    showConfetti,
  };
}
