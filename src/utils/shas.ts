import { DailyRecord } from '../db/database';
import dafDates from '../data/dafDates.json';
import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';

export function stripNiqqud(str: string) {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

export function getMasechetDafim(masechetHe: string): number[] {
  const masechetNameSafe = stripNiqqud(masechetHe);
  const keys = Object.keys(dafDates).filter(k => k.startsWith(masechetNameSafe + '_'));
  return keys.map(k => parseInt(k.split('_')[1], 10)).sort((a, b) => a - b);
}

export function getDafDateStr(masechetHe: string, dafNum: number): string | null {
  const masechetNameSafe = stripNiqqud(masechetHe);
  const key = `${masechetNameSafe}_${dafNum}`;
  // @ts-ignore
  return dafDates[key] || null;
}

export function getMasechetProgress(masechetHe: string, history: DailyRecord[]) {
  const dafim = getMasechetDafim(masechetHe);
  const masechetDates = new Set<string>();
  
  for (const d of dafim) {
    const dateStr = getDafDateStr(masechetHe, d);
    if (dateStr) masechetDates.add(dateStr);
  }

  // Count how many of these dates are marked as learned in history
  const learnedCount = history.filter(r => masechetDates.has(r.date) && r.status === 'learned').length;
  return learnedCount;
}

export function isDafLearnedByDate(dateStr: string, history: DailyRecord[]) {
  return history.some(r => r.date === dateStr && r.status === 'learned');
}
