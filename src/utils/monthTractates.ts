import { HDate } from '@hebcal/core';
import { DafYomiEvent } from '@hebcal/learning';

const NIKUD_REGEX = /[\u0591-\u05C7]/g;

export interface MonthTractateSpan {
  masechet: string;
  startDaf: string;
  endDaf: string;
  startDay: number;
  endDay: number;
  count: number;
}

export function getMonthTractates(month: number, year: number): MonthTractateSpan[] {
  const daysInMonth = HDate.daysInMonth(month, year);
  const spans: MonthTractateSpan[] = [];
  let current: MonthTractateSpan | null = null;

  for (let day = 1; day <= daysInMonth; day++) {
    const hdate = new HDate(day, month, year);
    const event = new DafYomiEvent(hdate);
    const text = event.render('he').replace('דַּף יוֹמִי: ', '');
    const parts = text.split(' דף ');
    const masechet = (parts[0] || '').replace(NIKUD_REGEX, '').trim();
    const daf = (parts[1] || '').replace(NIKUD_REGEX, '').trim();

    if (!current || current.masechet !== masechet) {
      if (current) {
        spans.push(current);
      }
      current = {
        masechet,
        startDaf: daf,
        endDaf: daf,
        startDay: day,
        endDay: day,
        count: 1,
      };
    } else {
      current.endDaf = daf;
      current.endDay = day;
      current.count += 1;
    }
  }

  if (current) {
    spans.push(current);
  }

  return spans;
}

export function formatMonthTractatesSummary(spans: MonthTractateSpan[]): string {
  if (spans.length === 0) {
    return '';
  }

  if (spans.length === 1) {
    const single = spans[0];
    if (single.startDaf === single.endDaf) {
      return `מסכת ${single.masechet} (דף ${single.startDaf})`;
    }
    return `מסכת ${single.masechet} (דפים ${single.startDaf} - ${single.endDaf})`;
  }

  if (spans.length === 2) {
    const first = spans[0];
    const second = spans[1];
    return `${first.masechet} (${first.startDaf} - ${first.endDaf}) • ${second.masechet} (${second.startDaf} - ${second.endDaf})`;
  }

  return spans.map((s) => s.masechet).join(' • ');
}

export function formatMonthTractatesShort(spans: MonthTractateSpan[]): string {
  if (spans.length === 0) {
    return '';
  }

  if (spans.length === 1) {
    return `מסכת ${spans[0].masechet}`;
  }

  return spans.map((s) => s.masechet).join(', ');
}

export function getYearMonthsTractates(year: number): Map<number, string> {
  const isLeap = HDate.isLeapYear(year);
  const monthOrder = isLeap
    ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]
    : [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

  const result = new Map<number, string>();

  for (const month of monthOrder) {
    const spans = getMonthTractates(month, year);
    const text = spans.map((s) => s.masechet).join(', ');
    result.set(month, text);
  }

  return result;
}
