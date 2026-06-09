import { subDays } from 'date-fns';
import { DailyRecord } from '../db/database';
import { SHAS_MASECHTOT, Seder, SEDARIM } from '../data/shas';
import { stripNiqqud } from './shas';
import { getDateStr } from './dafYomi';
import { getRecordProgress } from './dafStatus';
import dafDates from '../data/dafDates.json';

export interface SederProgressData {
  totalDafim: number;
  learnedDafim: number;
  completedMasechtot: number;
  totalMasechtot: number;
  percentage: number;
}

export interface ProgressCache {
  historyHash: string;
  masechetProgress: Map<string, { learned: number; total: number }>;
  sederProgress: Map<Seder, SederProgressData>;
  totalShasProgress: {
    learnedCount: number;
    totalPages: number;
    percentage: number;
  };
  streak: number;
}

let cachedResult: ProgressCache | null = null;

const dateToMasechet = new Map<string, string>();
for (const [key, dateStr] of Object.entries(dafDates as Record<string, string | undefined>)) {
  if (dateStr) {
    const masechetNameWithNiqqud = key.split('_')[0];
    const masechetName = stripNiqqud(masechetNameWithNiqqud);
    const match = SHAS_MASECHTOT.find(m => stripNiqqud(m.he) === masechetName);
    if (match) {
      dateToMasechet.set(dateStr, match.he);
    }
  }
}

function generateHistoryHash(history: DailyRecord[]): string {
  const progressSum = history.reduce((sum, r) => sum + getRecordProgress(r), 0);
  const firstDate = history[0]?.date || '';
  const lastDate = history[history.length - 1]?.date || '';
  return `${history.length}-${progressSum.toFixed(2)}-${firstDate}-${lastDate}`;
}

function calculateStreak(records: DailyRecord[]): number {
  const recordByDate = new Map(records.map(r => [r.date, r]));
  const todayStr = getDateStr(new Date());
  const yesterdayStr = getDateStr(subDays(new Date(), 1));

  let current = new Date();
  current.setHours(0, 0, 0, 0);

  let streak = 0;

  while (current.getFullYear() >= 2005) {
    const dateStr = getDateStr(current);
    const status = recordByDate.get(dateStr)?.status;

    if (status === 'learned') {
      streak++;
    } else if (status === 'partial') {
      // partial doesn't break streak but doesn't increase it
    } else {
      if (streak > 0) break;
      if (dateStr === todayStr) {
        current.setDate(current.getDate() - 1);
        continue;
      }
      if (dateStr === yesterdayStr) break;
      break;
    }

    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export function buildProgressCache(history: DailyRecord[]): ProgressCache {
  const historyHash = generateHistoryHash(history);
  
  if (cachedResult && cachedResult.historyHash === historyHash) {
    return cachedResult;
  }

  const masechetProgress = new Map<string, { learned: number; total: number }>();
  for (const masechet of SHAS_MASECHTOT) {
    masechetProgress.set(masechet.he, { learned: 0, total: masechet.pages });
  }

  let learnedCount = 0;
  for (const record of history) {
    const progress = getRecordProgress(record);
    if (progress <= 0) continue;

    const masechetName = dateToMasechet.get(record.date);
    if (masechetName) {
      const masechetStats = masechetProgress.get(masechetName);
      if (masechetStats) {
        masechetStats.learned += progress;
        learnedCount += progress;
      }
    }
  }

  const sederProgress = new Map<Seder, SederProgressData>();
  
  for (const seder of SEDARIM) {
    const sederMasechtot = SHAS_MASECHTOT.filter(m => m.seder === seder.id);
    
    let totalDafim = 0;
    let learnedDafim = 0;
    let completedMasechtot = 0;
    
    for (const masechet of sederMasechtot) {
      const progress = masechetProgress.get(masechet.he);
      if (progress) {
        totalDafim += progress.total;
        learnedDafim += progress.learned;
        
        if (progress.total > 0 && progress.learned >= progress.total) {
          completedMasechtot++;
        }
      }
    }
    
    const percentage = totalDafim > 0 
      ? Math.round((learnedDafim / totalDafim) * 100) 
      : 0;
    
    sederProgress.set(seder.id, {
      totalDafim,
      learnedDafim,
      completedMasechtot,
      totalMasechtot: sederMasechtot.length,
      percentage
    });
  }

  const totalPages = 2711;
  const percentage = Math.round((learnedCount / totalPages) * 100);
  
  const totalShasProgress = {
    learnedCount,
    totalPages,
    percentage
  };

  const streak = calculateStreak(history);

  cachedResult = {
    historyHash,
    masechetProgress,
    sederProgress,
    totalShasProgress,
    streak
  };

  return cachedResult;
}

export function invalidateProgressCache(): void {
  cachedResult = null;
}

export function getMasechetProgressFromCache(
  cache: ProgressCache,
  masechetHe: string
): { learned: number; total: number } {
  return cache.masechetProgress.get(masechetHe) || { learned: 0, total: 0 };
}

export function getSederProgressFromCache(
  cache: ProgressCache,
  seder: Seder
): SederProgressData {
  return cache.sederProgress.get(seder) || {
    totalDafim: 0,
    learnedDafim: 0,
    completedMasechtot: 0,
    totalMasechtot: 0,
    percentage: 0
  };
}
