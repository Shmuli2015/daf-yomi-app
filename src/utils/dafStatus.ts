import type { DailyRecord } from '../db/database';

export type DafStudyStatus = 'missed' | 'partial' | 'learned';
export type AmudSide = 'a' | 'b';

export interface StatusRecordLike {
  status?: string | null;
  amud?: AmudSide | null;
}

export function getPartialAmud(record: StatusRecordLike | null | undefined): AmudSide | null {
  if (!record || record.status !== 'partial') return null;
  return record.amud ?? null;
}

export function resolveAmudMark(
  _existing: StatusRecordLike | null | undefined,
  amud: AmudSide
): { status: 'learned' | 'partial'; percentage: number; amud: AmudSide | null } {
  return { status: 'partial', percentage: 50, amud };
}

export function getRecordProgress(record: DailyRecord | null | undefined): number {
  if (!record) return 0;
  if (record.status === 'learned') return 1;
  if (record.status === 'partial') return (record.percentage || 50) / 100;
  return 0;
}

export function getStudyStatus(record: StatusRecordLike | null | undefined): 'none' | 'partial' | 'learned' {
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

export function formatPartialAmudLabel(amud: AmudSide | null | undefined): string {
  return amud === 'b' ? 'עמוד ב׳ נלמד' : 'עמוד א׳ נלמד';
}
