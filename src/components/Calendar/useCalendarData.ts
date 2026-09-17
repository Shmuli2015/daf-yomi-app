import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function useCalendarData() {
  const history = useAppStore((s) => s.history);
  const showCalendarDaf = useAppStore((s) => s.settings?.show_calendar_daf === 1);
  const showConfetti = useAppStore((s) => s.settings?.show_confetti === 1);

  const recordByDate = useMemo(() => new Map(history.map((r) => [r.date, r])), [history]);

  return {
    recordByDate,
    showCalendarDaf,
    showConfetti,
  };
}
