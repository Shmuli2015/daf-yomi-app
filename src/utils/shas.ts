import { DailyRecord } from '../db/database';
import dafDates from '../data/dafDates.json';
import { SHAS_MASECHTOT, SEDARIM, Seder, numberToGematria } from '../data/shas';

export function stripNiqqud(str: string) {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

const masechetDafimByName = new Map<string, number[]>();

export function getMasechetDafim(masechetHe: string): number[] {
  const masechetNameSafe = stripNiqqud(masechetHe);
  const hit = masechetDafimByName.get(masechetNameSafe);
  if (hit !== undefined) return hit;

  const keys = Object.keys(dafDates).filter(k => k.startsWith(masechetNameSafe + '_'));
  const dafim = keys.map(k => parseInt(k.split('_')[1], 10)).sort((a, b) => a - b);
  masechetDafimByName.set(masechetNameSafe, dafim);
  return dafim;
}

export function getDafDateStr(masechetHe: string, dafNum: number): string | null {
  const masechetNameSafe = stripNiqqud(masechetHe);
  const key = `${masechetNameSafe}_${dafNum}`;
  return (dafDates as Record<string, string | undefined>)[key] ?? null;
}

export function getMasechetProgress(masechetHe: string, history: DailyRecord[]) {
  const dafim = getMasechetDafim(masechetHe);
  const masechetDates = new Set<string>();
  
  for (const d of dafim) {
    const dateStr = getDafDateStr(masechetHe, d);
    if (dateStr) masechetDates.add(dateStr);
  }

  const learnedCount = history.filter(r => masechetDates.has(r.date) && r.status === 'learned').length;
  return learnedCount;
}

export function isDafLearnedByDate(dateStr: string, history: DailyRecord[]) {
  return history.some(r => r.date === dateStr && r.status === 'learned');
}

export function buildLearnedDateSet(history: DailyRecord[]): Set<string> {
  const set = new Set<string>();
  for (const r of history) {
    if (r.status === 'learned') set.add(r.date);
  }
  return set;
}

export function getTotalShasProgress(history: DailyRecord[]) {
  const totalPages = 2711;
  const learnedCount = history.filter(r => r.status === 'learned').length;
  const percentage = Math.round((learnedCount / totalPages) * 100);
  return { learnedCount, totalPages, percentage };
}

export function getSederProgress(seder: Seder, history: DailyRecord[]) {
  const sederMasechtot = SHAS_MASECHTOT.filter(m => m.seder === seder);
  
  let totalDafim = 0;
  let learnedDafim = 0;
  let completedMasechtot = 0;
  
  for (const masechet of sederMasechtot) {
    const dafim = getMasechetDafim(masechet.he);
    const learned = getMasechetProgress(masechet.he, history);
    
    totalDafim += dafim.length;
    learnedDafim += learned;
    
    if (dafim.length > 0 && learned === dafim.length) {
      completedMasechtot++;
    }
  }
  
  const percentage = totalDafim > 0 ? Math.round((learnedDafim / totalDafim) * 100) : 0;
  
  return {
    totalDafim,
    learnedDafim,
    completedMasechtot,
    totalMasechtot: sederMasechtot.length,
    percentage
  };
}

export function getMasechtotBySeder(seder: Seder) {
  return SHAS_MASECHTOT.filter(m => m.seder === seder);
}
