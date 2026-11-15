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

export type UpcomingMasechetStatus = 'upcoming' | 'starting_today' | 'just_started';

export interface UpcomingMasechetInfo {
  masechetHe: string;
  masechetEn: string;
  daysLeft: number;
  startDateStr: string;
  hebrewDateStr: string;
  dayOfWeekHe: string;
  status: UpcomingMasechetStatus;
  daysSinceStart?: number;
}

export function getUpcomingMasechetInfo(
  currentDate: Date = new Date(),
  maxDaysAhead = 6,
): UpcomingMasechetInfo | null {
  for (let pastOffset = 0; pastOffset >= -2; pastOffset -= 1) {
    const startCandidate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + pastOffset,
      12,
      0,
      0,
    );
    const prevCandidate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + pastOffset - 1,
      12,
      0,
      0,
    );

    const startDaf = getDafByDate(startCandidate);
    const prevDaf = getDafByDate(prevCandidate);

    const isTransition =
      startDaf.masechetEn !== prevDaf.masechetEn ||
      (startDaf.dafNum === 2 && prevDaf.dafNum !== 2);

    if (isTransition) {
      const hdate = new HDate(startCandidate);
      const cleanHebrewDate = hdate.renderGematriya().replace(/[\u0591-\u05C7]/g, '');
      const dayOfWeekHe = HEBREW_DAYS[startCandidate.getDay()] || '';
      const daysSinceStart = Math.abs(pastOffset);
      const status: UpcomingMasechetStatus =
        daysSinceStart === 0 ? 'starting_today' : 'just_started';

      return {
        masechetHe: startDaf.masechet,
        masechetEn: startDaf.masechetEn,
        daysLeft: 0,
        startDateStr: getDateStr(startCandidate),
        hebrewDateStr: cleanHebrewDate,
        dayOfWeekHe,
        status,
        daysSinceStart,
      };
    }
  }

  for (let futureOffset = 1; futureOffset <= maxDaysAhead; futureOffset += 1) {
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + futureOffset,
      12,
      0,
      0,
    );
    const prevDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + futureOffset - 1,
      12,
      0,
      0,
    );

    const checkDaf = getDafByDate(checkDate);
    const prevDaf = getDafByDate(prevDate);

    const isTransition =
      checkDaf.masechetEn !== prevDaf.masechetEn ||
      (checkDaf.dafNum === 2 && prevDaf.dafNum !== 2);

    if (isTransition) {
      const hdate = new HDate(checkDate);
      const cleanHebrewDate = hdate.renderGematriya().replace(/[\u0591-\u05C7]/g, '');
      const dayOfWeekHe = HEBREW_DAYS[checkDate.getDay()] || '';

      return {
        masechetHe: checkDaf.masechet,
        masechetEn: checkDaf.masechetEn,
        daysLeft: futureOffset,
        startDateStr: getDateStr(checkDate),
        hebrewDateStr: cleanHebrewDate,
        dayOfWeekHe,
        status: 'upcoming',
      };
    }
  }

  return null;
}
