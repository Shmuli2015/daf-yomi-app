import { subDays } from 'date-fns';
import { getDateStr } from './dafYomi';

type HistoryLike = { date: string; status?: string | null };

export function shouldShowYesterdayNudge(
  history: HistoryLike[],
  today: Date,
): boolean {
  const yesterdayStr = getDateStr(subDays(today, 1));
  const dayBeforeStr = getDateStr(subDays(today, 2));
  const byDate = new Map(history.map((record) => [record.date, record.status]));
  const yesterdayStatus = byDate.get(yesterdayStr);
  if (yesterdayStatus === 'learned' || yesterdayStatus === 'partial') {
    return false;
  }
  const dayBeforeStatus = byDate.get(dayBeforeStr);
  return dayBeforeStatus === 'learned' || dayBeforeStatus === 'partial';
}
