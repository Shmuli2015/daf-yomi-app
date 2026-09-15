import { DailyRecord } from '../db/database';
import dafDates from '../data/dafDates.json';
import { SHAS_MASECHTOT, SEDARIM, Seder, numberToGematria } from '../data/shas';
import { getRecordProgress } from './dafStatus';
import { isTamidMasechet, isTamidStartDaf, TAMID_START_DAF } from './mishnahOnlySefaria';

export function stripNiqqud(str: string) {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

const normalizedDafDates = new Map<string, string>();
for (const [key, value] of Object.entries(dafDates as Record<string, string>)) {
  const lastUnderscore = key.lastIndexOf('_');
  if (lastUnderscore === -1) continue;
  const masechetPart = stripNiqqud(key.slice(0, lastUnderscore));
  const dafPart = key.slice(lastUnderscore + 1);
  normalizedDafDates.set(`${masechetPart}_${dafPart}`, value);
}

export const MASECHTOT_ENDING_ON_AMUD_A = new Set([
  'Berachot',
  'Moed Katan',
  'Chagigah',
  'Yevamot',
  'Ketubot',
  'Nedarim',
  'Nazir',
  'Sotah',
  'Horayot',
  'Zevachim',
  'Menachot',
  'Chullin',
  'Bechorot',
  'Arachin',
  'Temurah',
  'Meilah',
  'Niddah',
]);

const MASECHTOT_ENDING_ON_AMUD_A_HE = new Set([
  'ברכות',
  'מועד קטן',
  'חגיגה',
  'יבמות',
  'כתובות',
  'נדרים',
  'נזיר',
  'סוטה',
  'הוריות',
  'זבחים',
  'מנחות',
  'חולין',
  'בכורות',
  'ערכין',
  'תמורה',
  'מעילה',
  'נדה',
]);

export function doesMasechetEndOnAmudA(masechetName: string): boolean {
  const clean = stripNiqqud(masechetName).trim().toLowerCase();
  for (const en of MASECHTOT_ENDING_ON_AMUD_A) {
    if (en.toLowerCase() === clean) return true;
  }
  for (const he of MASECHTOT_ENDING_ON_AMUD_A_HE) {
    if (stripNiqqud(he) === clean) return true;
  }
  return false;
}

export function isAmudAvailable(masechetName: string, dafNum: number, amud: 'a' | 'b'): boolean {
  if (isTamidStartDaf(masechetName, dafNum)) {
    return amud === 'b';
  }
  if (amud === 'a') return true;
  const dafim = getMasechetDafim(masechetName);
  const lastDaf = dafim.length > 0 ? dafim[dafim.length - 1] : 2;
  if (dafNum === lastDaf && doesMasechetEndOnAmudA(masechetName)) {
    return false;
  }
  return true;
}

const masechetDafimByName = new Map<string, number[]>();

export function getMasechetDafim(masechetName: string): number[] {
  const cleanName = stripNiqqud(masechetName).trim();
  const hit = masechetDafimByName.get(cleanName);
  if (hit !== undefined) return hit;

  const match = SHAS_MASECHTOT.find(
    (m) => m.en.toLowerCase() === cleanName.toLowerCase() || stripNiqqud(m.he) === cleanName
  );
  const masechetNameSafe = match ? stripNiqqud(match.he) : cleanName;

  const cachedByHebrew = masechetDafimByName.get(masechetNameSafe);
  if (cachedByHebrew !== undefined) {
    masechetDafimByName.set(cleanName, cachedByHebrew);
    return cachedByHebrew;
  }

  const prefix = masechetNameSafe + '_';
  const dafim: number[] = [];
  for (const k of normalizedDafDates.keys()) {
    if (k.startsWith(prefix)) {
      const dafNum = parseInt(k.slice(prefix.length), 10);
      if (!isNaN(dafNum)) dafim.push(dafNum);
    }
  }
  dafim.sort((a, b) => a - b);
  if (dafim.length === 0 && match) {
    for (let i = 0; i < match.pages; i++) {
      dafim.push(i + 2);
    }
  }
  masechetDafimByName.set(masechetNameSafe, dafim);
  masechetDafimByName.set(cleanName, dafim);
  return dafim;
}

export function getReaderDafim(masechetName: string): number[] {
  const dafim = getMasechetDafim(masechetName);
  if (!isTamidMasechet(masechetName) && masechetName !== 'תמיד') {
    return dafim;
  }
  if (dafim.includes(TAMID_START_DAF)) return dafim;
  return [TAMID_START_DAF, ...dafim];
}

export function getDafDateStr(masechetHe: string, dafNum: number): string | null {
  const masechetNameSafe = stripNiqqud(masechetHe);
  if (
    dafNum === TAMID_START_DAF &&
    (masechetNameSafe === 'תמיד' || isTamidMasechet(masechetHe))
  ) {
    return normalizedDafDates.get(`קינים_${TAMID_START_DAF}`) ?? null;
  }
  const key = `${masechetNameSafe}_${dafNum}`;
  return normalizedDafDates.get(key) ?? null;
}

export function getMasechetProgress(masechetHe: string, history: DailyRecord[]) {
  const dafim = getMasechetDafim(masechetHe);
  const masechetDates = new Set<string>();
  
  for (const d of dafim) {
    const dateStr = getDafDateStr(masechetHe, d);
    if (dateStr) masechetDates.add(dateStr);
  }

  let learnedCount = 0;
  for (const r of history) {
    if (masechetDates.has(r.date)) {
      learnedCount += getRecordProgress(r);
    }
  }
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
  const learnedCount = history.reduce((sum, r) => sum + getRecordProgress(r), 0);
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
    
    if (dafim.length > 0 && learned >= dafim.length) {
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
