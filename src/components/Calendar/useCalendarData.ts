import { useAppStore } from '../../store/useAppStore';

export function useCalendarData() {
  const recordByDate = useAppStore((s) => s.recordByDate);
  const showCalendarDaf = useAppStore((s) => s.settings?.show_calendar_daf === 1);
  const showConfetti = useAppStore((s) => s.settings?.show_confetti === 1);
  const showSecularDate = useAppStore((s) => s.settings?.show_secular_date === 1);

  return {
    recordByDate,
    showCalendarDaf,
    showConfetti,
    showSecularDate,
  };
}
