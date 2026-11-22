import { numberToGematria } from '../data/shas';
import type { DailyRecord } from '../db/database';
import { getStudyStatus } from './dafStatus';
import { getDafDateStr } from './shas';

export interface MasechetBulkDafUpdate {
  dateStr: string;
  masechet: string;
  daf: string;
}

export function buildMasechetRecordByDate(
  source: DailyRecord[] | Map<string, DailyRecord>,
  masechetHe: string,
  dafim: number[],
): Map<string, DailyRecord> {
  const dates: string[] = [];
  for (const dafNum of dafim) {
    const dateStr = getDafDateStr(masechetHe, dafNum);
    if (dateStr) dates.push(dateStr);
  }

  const map = new Map<string, DailyRecord>();
  if (source instanceof Map) {
    for (let i = 0; i < dates.length; i += 1) {
      const dateStr = dates[i];
      const record = source.get(dateStr);
      if (record) map.set(dateStr, record);
    }
    return map;
  }

  const dateSet = new Set(dates);
  for (const record of source) {
    if (dateSet.has(record.date)) {
      map.set(record.date, record);
    }
  }
  return map;
}

export function buildMasechetMarkAllUpdates(
  masechetHe: string,
  dafim: number[],
  recordByDate: Map<string, DailyRecord>,
): MasechetBulkDafUpdate[] {
  const updates: MasechetBulkDafUpdate[] = [];
  for (const dafNum of dafim) {
    const dateStr = getDafDateStr(masechetHe, dafNum);
    if (!dateStr) continue;
    if (getStudyStatus(recordByDate.get(dateStr)) === 'learned') continue;
    updates.push({
      dateStr,
      masechet: masechetHe,
      daf: `דף ${numberToGematria(dafNum)}`,
    });
  }
  return updates;
}

export function buildMasechetUnmarkAllUpdates(
  masechetHe: string,
  dafim: number[],
  recordByDate: Map<string, DailyRecord>,
): MasechetBulkDafUpdate[] {
  const updates: MasechetBulkDafUpdate[] = [];
  for (const dafNum of dafim) {
    const dateStr = getDafDateStr(masechetHe, dafNum);
    if (!dateStr) continue;
    if (getStudyStatus(recordByDate.get(dateStr)) === 'none') continue;
    updates.push({
      dateStr,
      masechet: masechetHe,
      daf: `דף ${numberToGematria(dafNum)}`,
    });
  }
  return updates;
}
