import { format, subDays } from "date-fns";
import { getDateStr } from "./dafYomi";

const DAYS_HE = ["א", "ב", "ג", "ד", "ה", "ו", "ש"] as const;

export type Last7DayRecord = {
  date: Date;
  dateStr: string;
  status: string;
  dayName: string;
  dayNameHe: string;
  isToday: boolean;
};

export function buildLast7Days(
  history: Array<{ date: string; status?: string }>,
  today: Date,
): Last7DayRecord[] {
  const todayDateStr = getDateStr(today);
  const historyMap = new Map<string, { date: string; status?: string }>();
  const targetDates = new Set<string>();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = getDateStr(d);
    targetDates.add(dateStr);
    return { d, dateStr };
  });

  for (const r of history) {
    if (targetDates.has(r.date)) {
      historyMap.set(r.date, r);
      if (historyMap.size === targetDates.size) break;
    }
  }

  return days.map(({ d, dateStr }) => {
    const record = historyMap.get(dateStr);
    return {
      date: d,
      dateStr,
      status: record?.status || "missed",
      dayName: format(d, "EEEEEE"),
      dayNameHe: DAYS_HE[d.getDay()],
      isToday: dateStr === todayDateStr,
    };
  });
}
