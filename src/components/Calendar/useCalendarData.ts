import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function useCalendarData() {
  const history = useAppStore((s) => s.history);
  const settings = useAppStore((s) => s.settings);

  const recordByDate = useMemo(() => new Map(history.map((r) => [r.date, r])), [history]);
  const showCalendarDaf = settings?.show_calendar_daf === 1;
  const showConfetti = settings?.show_confetti === 1;

  return {
    recordByDate,
    showCalendarDaf,
    showConfetti,
  };
}
