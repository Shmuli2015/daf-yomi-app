import { subDays } from 'date-fns';
import { DailyRecord, PersonalTrackRecord } from '../db/database';
import { SHAS_MASECHTOT, Seder, SEDARIM } from '../data/shas';
import { getMasechetDafim, getDafDateStr, stripNiqqud } from './shas';
import { getDateStr } from './dafYomi';
import { getRecordProgress } from './dafStatus';

export interface SederProgressData {
  totalDafim: number;
  learnedDafim: number;
  completedMasechtot: number;
  totalMasechtot: number;
  percentage: number;
}

export interface MasechetProgressInfo {
  learned: number;
  total: number;
  dafYomiLearned: number;
  personalLearned: number;
}

export interface TotalShasProgress {
  learnedCount: number;
  totalPages: number;
  percentage: number;
  dafYomiCount: number;
  personalCount: number;
}

export interface ProgressCache {
  historyHash: string;
  masechetProgress: Map<string, MasechetProgressInfo>;
  sederProgress: Map<Seder, SederProgressData>;
  totalShasProgress: TotalShasProgress;
  streak: number;
}

let cachedResult: ProgressCache | null = null;

function normalizeMasechetKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .replace(/kh/g, 'ch')
    .replace(/v/g, 'b');
}

function findShasMasechet(name: string) {
  const clean = normalizeMasechetKey(name);
  return SHAS_MASECHTOT.find(
    m =>
      normalizeMasechetKey(m.en) === clean ||
      m.en.toLowerCase() === name.trim().toLowerCase() ||
      stripNiqqud(m.he) === stripNiqqud(name)
  );
}

function generateHistoryHash(history: DailyRecord[], personalRecords: PersonalTrackRecord[] = []): string {
  const progressSum = history.reduce((sum, r) => sum + getRecordProgress(r), 0);
  const personalLearnedCount = personalRecords.filter(r => r.status === 'learned').length;
  const personalPartialCount = personalRecords.filter(r => r.status === 'partial').length;
  const firstDate = history[0]?.date || '';
  const lastDate = history[history.length - 1]?.date || '';
  return `${history.length}-${progressSum.toFixed(2)}-${firstDate}-${lastDate}-${personalRecords.length}-${personalLearnedCount}-${personalPartialCount}`;
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
    } else if (status !== 'partial') {
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

export function buildProgressCache(
  history: DailyRecord[],
  personalRecords: PersonalTrackRecord[] = []
): ProgressCache {
  const historyHash = generateHistoryHash(history, personalRecords);
  
  if (cachedResult && cachedResult.historyHash === historyHash) {
    return cachedResult;
  }

  const historyByDate = new Map<string, DailyRecord>();
  for (const r of history) {
    historyByDate.set(r.date, r);
  }

  const personalByKey = new Map<string, PersonalTrackRecord>();
  for (const r of personalRecords) {
    const matched = findShasMasechet(r.masechet);
    const masechetKey = matched ? matched.en : r.masechet;
    personalByKey.set(`${masechetKey}_${r.daf_num}`, r);
  }

  const masechetProgress = new Map<string, MasechetProgressInfo>();
  let totalLearnedCount = 0;
  let totalDafYomiCount = 0;
  let totalPersonalCount = 0;

  for (const masechet of SHAS_MASECHTOT) {
    const dafim = getMasechetDafim(masechet.he);
    let masechetLearned = 0;
    let dafYomiLearned = 0;
    let personalLearned = 0;

    for (const dafNum of dafim) {
      const dateStr = getDafDateStr(masechet.he, dafNum);
      const historyRecord = dateStr ? historyByDate.get(dateStr) : undefined;
      const personalRecord = personalByKey.get(`${masechet.en}_${dafNum}`);

      const dafYomiProg = historyRecord ? getRecordProgress(historyRecord) : 0;
      const personalProg = personalRecord?.status === 'learned' ? 1 : personalRecord?.status === 'partial' ? 0.5 : 0;

      if (dafYomiProg > 0) dafYomiLearned += dafYomiProg;
      if (personalProg > 0) personalLearned += personalProg;

      const combinedProg = Math.max(dafYomiProg, personalProg);
      masechetLearned += combinedProg;
    }

    masechetProgress.set(masechet.he, {
      learned: masechetLearned,
      total: masechet.pages,
      dafYomiLearned,
      personalLearned,
    });

    totalLearnedCount += masechetLearned;
    totalDafYomiCount += dafYomiLearned;
    totalPersonalCount += personalLearned;
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
  const percentage = Math.round((totalLearnedCount / totalPages) * 100);
  
  const totalShasProgress: TotalShasProgress = {
    learnedCount: totalLearnedCount,
    totalPages,
    percentage,
    dafYomiCount: totalDafYomiCount,
    personalCount: totalPersonalCount,
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
): MasechetProgressInfo {
  return cache.masechetProgress.get(masechetHe) || { learned: 0, total: 0, dafYomiLearned: 0, personalLearned: 0 };
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
