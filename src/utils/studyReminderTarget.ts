import { getDafByDate } from './dafYomi';
import type { Amud } from './dafNavigation';

export type StudyReminderTarget = {
  masechetEn: string;
  masechetHe: string;
  dafNum: number;
  amud: Amud;
};

export function buildStudyReminderTarget(date: Date): StudyReminderTarget {
  const daf = getDafByDate(date);
  return {
    masechetEn: daf.masechetEn,
    masechetHe: daf.masechet,
    dafNum: daf.dafNum,
    amud: daf.amud,
  };
}

function parseDataRecord(raw: unknown): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
}

export function parseStudyReminderTarget(raw: unknown): StudyReminderTarget | null {
  const data = parseDataRecord(raw);
  if (!data) return null;
  const { masechetEn, masechetHe, dafNum, amud } = data;
  if (typeof masechetEn !== 'string' || masechetEn.length === 0) return null;
  if (typeof masechetHe !== 'string' || masechetHe.length === 0) return null;
  if (typeof dafNum !== 'number' || !Number.isInteger(dafNum) || dafNum < 1) return null;
  if (amud !== 'a' && amud !== 'b') return null;
  return { masechetEn, masechetHe, dafNum, amud };
}

type ResponseShape = {
  data?: unknown;
  dataString?: unknown;
  request?: { content?: { data?: unknown } };
  notification?: { request?: { content?: { data?: unknown } } };
  notificationResponse?: { notification?: { request?: { content?: { data?: unknown } } } };
};

export function getStudyReminderTargetFromResponse(response: unknown): StudyReminderTarget | null {
  if (!response || typeof response !== 'object') return null;
  const value = response as ResponseShape;
  const candidates = [
    value.notification?.request?.content?.data,
    value.notificationResponse?.notification?.request?.content?.data,
    value.request?.content?.data,
    value.data,
    value.dataString,
  ];
  for (const candidate of candidates) {
    const target = parseStudyReminderTarget(candidate);
    if (target) return target;
  }
  return null;
}
