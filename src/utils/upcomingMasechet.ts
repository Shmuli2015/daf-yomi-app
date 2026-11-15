import { HDate } from '@hebcal/core';
import { getDafByDate, getDateStr } from './dafYomi';

const HEBREW_DAYS = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת קודש',
];

export interface UpcomingMasechetInfo {
  masechetHe: string;
  masechetEn: string;
  daysLeft: number;
  startDateStr: string;
  hebrewDateStr: string;
  dayOfWeekHe: string;
}

export function getUpcomingMasechetInfo(
  currentDate: Date = new Date(),
  maxDaysAhead = 6,
): UpcomingMasechetInfo | null {
  for (let offset = 0; offset <= maxDaysAhead; offset += 1) {
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + offset,
      12,
      0,
      0,
    );
    const prevDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + offset - 1,
      12,
      0,
      0,
    );

    const checkDaf = getDafByDate(checkDate);
    const prevDaf = getDafByDate(prevDate);

    const isTransition =
      checkDaf.masechetEn !== prevDaf.masechetEn || (checkDaf.dafNum === 2 && prevDaf.dafNum !== 2);

    if (isTransition) {
      const hdate = new HDate(checkDate);
      const cleanHebrewDate = hdate.renderGematriya().replace(/[\u0591-\u05C7]/g, '');
      const dayOfWeekHe = HEBREW_DAYS[checkDate.getDay()] || '';

      return {
        masechetHe: checkDaf.masechet,
        masechetEn: checkDaf.masechetEn,
        daysLeft: offset,
        startDateStr: getDateStr(checkDate),
        hebrewDateStr: cleanHebrewDate,
        dayOfWeekHe,
      };
    }
  }

  return null;
}
