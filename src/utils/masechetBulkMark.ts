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
  history: DailyRecord[],
  masechetHe: string,
  dafim: number[],
): Map<string, DailyRecord> {
  const dates = new Set<string>();
  for (const dafNum of dafim) {
    const dateStr = getDafDateStr(masechetHe, dafNum);
    if (dateStr) dates.add(dateStr);
  }

  const map = new Map<string, DailyRecord>();
  for (const record of history) {
    if (dates.has(record.date)) {
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
