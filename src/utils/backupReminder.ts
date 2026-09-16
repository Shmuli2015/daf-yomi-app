import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale/he';

export const BACKUP_STALE_DAYS = 30;

export function formatLastBackupAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), 'd בMMMM yyyy', { locale: he });
  } catch {
    return null;
  }
}

export function isBackupStale(
  iso: string | null | undefined,
  now: Date = new Date(),
  staleDays: number = BACKUP_STALE_DAYS,
): boolean {
  if (!iso) return true;
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return true;
  const diffMs = now.getTime() - parsed;
  return diffMs >= staleDays * 24 * 60 * 60 * 1000;
}

export function getBackupReminderText(iso: string | null | undefined, now: Date = new Date()): string | null {
  if (!iso) {
    return 'מומלץ לגבות את נתוני הלימוד לקובץ.';
  }
  if (isBackupStale(iso, now)) {
    return 'מומלץ לגבות. עברו יותר מ-30 יום מאז הגיבוי האחרון.';
  }
  return null;
}
