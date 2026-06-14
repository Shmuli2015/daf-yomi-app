import type { DailyRecord } from '../db/database';

export type DafStudyStatus = 'missed' | 'partial' | 'learned';
export type AmudSide = 'a' | 'b';

export function getPartialAmud(record: DailyRecord | null | undefined): AmudSide | null {
  if (!record || record.status !== 'partial') return null;
  return record.amud ?? null;
}

export function resolveAmudMark(
  existing: DailyRecord | null | undefined,
  amud: AmudSide
): Pick<DailyRecord, 'status' | 'percentage' | 'amud'> {
  if (existing?.status === 'learned') {
    return { status: 'learned', percentage: 100, amud: null };
  }
  if (existing?.status === 'partial' && existing.amud && existing.amud !== amud) {
    return { status: 'learned', percentage: 100, amud: null };
  }
  return { status: 'partial', percentage: 50, amud };
}

export function getRecordProgress(record: DailyRecord | null | undefined): number {
  if (!record) return 0;
  if (record.status === 'learned') return 1;
  if (record.status === 'partial') return (record.percentage || 50) / 100;
  return 0;
}

export function getStudyStatus(record: DailyRecord | null | undefined): 'none' | 'partial' | 'learned' {
  if (!record) return 'none';
  if (record.status === 'learned') return 'learned';
  if (record.status === 'partial') return 'partial';
  return 'none';
}

export function statusToPercentage(status: DafStudyStatus): number {
  if (status === 'learned') return 100;
  if (status === 'partial') return 50;
  return 0;
}

export function formatProgressCount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
