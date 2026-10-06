import { db } from './connection';
import type { DailyRecord } from './types';

export function getDailyRecord(dateStr: string): DailyRecord | null {
  return db.getFirstSync('SELECT * FROM daily_daf WHERE date = ?', [dateStr]) as DailyRecord | null;
}

export function updateDailyRecord(
  dateStr: string,
  masechet: string,
  daf: string,
  status: 'learned' | 'partial' | 'missed',
  percentage?: number,
  amud?: 'a' | 'b' | null
) {
  const pct = percentage ?? (status === 'learned' ? 100 : status === 'partial' ? 50 : 0);
  const amudValue = amud !== undefined ? amud : status === 'partial' ? null : null;
  const learnedAt = new Date().toISOString();
  db.runSync(
    `INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       masechet = excluded.masechet,
       daf = excluded.daf,
       status = excluded.status,
       percentage = excluded.percentage,
       amud = excluded.amud,
       learnedAt = excluded.learnedAt`,
    [dateStr, masechet, daf, status, pct, amudValue, learnedAt]
  );
}

export function batchUpdateDailyRecords(
  updates: Array<{
    dateStr: string;
    masechet: string;
    daf: string;
    status: 'learned' | 'partial' | 'missed';
    percentage?: number;
    amud?: 'a' | 'b' | null;
  }>
) {
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    for (const { dateStr, masechet, daf, status, percentage, amud } of updates) {
      const pct = percentage ?? (status === 'learned' ? 100 : status === 'partial' ? 50 : 0);
      const amudValue = amud !== undefined ? amud : null;
      db.runSync(
        `INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET
           masechet = excluded.masechet,
           daf = excluded.daf,
           status = excluded.status,
           percentage = excluded.percentage,
           amud = excluded.amud,
           learnedAt = excluded.learnedAt`,
        [dateStr, masechet, daf, status, pct, amudValue, now]
      );
    }
  });
}

export function getAllRecords(): DailyRecord[] {
  return db.getAllSync('SELECT * FROM daily_daf ORDER BY date DESC') as DailyRecord[];
}

export function resetDafYomiRecords() {
  db.execSync('DELETE FROM daily_daf;');
}
