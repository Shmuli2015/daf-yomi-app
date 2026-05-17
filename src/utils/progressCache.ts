import { DailyRecord } from '../db/database';
import { SHAS_MASECHTOT, Seder, SEDARIM } from '../data/shas';
import { stripNiqqud } from './shas';
import { getDateStr } from './dafYomi';
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
  const learnedCount = history.filter(r => r.status === 'learned').length;
  const firstDate = history[0]?.date || '';
  const lastDate = history[history.length - 1]?.date || '';
  return `${history.length}-${learnedCount}-${firstDate}-${lastDate}`;
}

function calculateStreak(records: DailyRecord[]): number {
  const learnedRecords = records
    .filter(r => r.status === 'learned')
    .sort((a, b) => b.date.localeCompare(a.date));

  if (learnedRecords.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = getDateStr(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayStr = getDateStr(yesterday);

  const learnedDateSet = new Set(learnedRecords.map(r => r.date));
  if (!learnedDateSet.has(todayStr) && !learnedDateSet.has(yesterdayStr)) {
    return 0;
  }

  const latestDateStr = learnedRecords[0].date;

  let streak = 0;
  let currentDateToCheck = new Date(latestDateStr);
  currentDateToCheck.setHours(0, 0, 0, 0);

  for (const record of learnedRecords) {
    if (record.date === getDateStr(currentDateToCheck)) {
      streak++;
      currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function buildProgressCache(history: DailyRecord[]): ProgressCache {
  const historyHash = generateHistoryHash(history);
  
  if (cachedResult && cachedResult.historyHash === historyHash) {
    return cachedResult;
  }

  const learnedDates = new Set(
    history.filter(r => r.status === 'learned').map(r => r.date)
  );

  const masechetProgress = new Map<string, { learned: number; total: number }>();
  for (const masechet of SHAS_MASECHTOT) {
    masechetProgress.set(masechet.he, { learned: 0, total: masechet.pages });
  }

  let learnedCount = 0;
  for (const dateStr of learnedDates) {
    const masechetName = dateToMasechet.get(dateStr);
    if (masechetName) {
      const progress = masechetProgress.get(masechetName);
      if (progress) {
        progress.learned++;
        learnedCount++;
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
        
        if (progress.total > 0 && progress.learned === progress.total) {
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

