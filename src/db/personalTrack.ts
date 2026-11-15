import { db } from './connection';
import type { PersonalTrackRecord } from './types';

export function getPersonalTrackRecords(masechet?: string): PersonalTrackRecord[] {
  if (masechet) {
    return db.getAllSync('SELECT * FROM personal_track_daf WHERE masechet = ? ORDER BY daf_num ASC', [masechet]) as PersonalTrackRecord[];
  }
  return db.getAllSync('SELECT * FROM personal_track_daf ORDER BY daf_num ASC') as PersonalTrackRecord[];
}

export function updatePersonalTrackRecord(
  masechet: string,
  dafNum: number,
  status: 'learned' | 'partial' | 'none',
  amud?: 'a' | 'b' | null,
  stopPoint?: string | null
) {
  const now = new Date().toISOString();
  if (status === 'none') {
    db.runSync('DELETE FROM personal_track_daf WHERE masechet = ? AND daf_num = ?', [masechet, dafNum]);
  } else {
    const hasStopPointArg = stopPoint !== undefined ? 1 : 0;
    const stopPointValue = status === 'learned' ? null : (stopPoint ?? null);
    db.runSync(
      `INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt, stop_point)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(masechet, daf_num) DO UPDATE SET
         status = excluded.status,
         amud = excluded.amud,
         learnedAt = excluded.learnedAt,
         stop_point = CASE
           WHEN excluded.status = 'learned' THEN NULL
           WHEN ? = 1 THEN excluded.stop_point
           ELSE personal_track_daf.stop_point
         END`,
      [masechet, dafNum, status, amud ?? null, now, stopPointValue, hasStopPointArg]
    );
  }
}

export function batchUpdatePersonalTrackRecords(
  updates: Array<{
    masechet: string;
    dafNum: number;
    status: 'learned' | 'partial' | 'none';
    amud?: 'a' | 'b' | null;
    stopPoint?: string | null;
  }>
) {
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    for (const { masechet, dafNum, status, amud, stopPoint } of updates) {
      if (status === 'none') {
        db.runSync('DELETE FROM personal_track_daf WHERE masechet = ? AND daf_num = ?', [masechet, dafNum]);
      } else {
        const hasStopPointArg = stopPoint !== undefined ? 1 : 0;
        const stopPointValue = status === 'learned' ? null : (stopPoint ?? null);
        db.runSync(
          `INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt, stop_point)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(masechet, daf_num) DO UPDATE SET
             status = excluded.status,
             amud = excluded.amud,
             learnedAt = excluded.learnedAt,
             stop_point = CASE
               WHEN excluded.status = 'learned' THEN NULL
               WHEN ? = 1 THEN excluded.stop_point
               ELSE personal_track_daf.stop_point
             END`,
          [masechet, dafNum, status, amud ?? null, now, stopPointValue, hasStopPointArg]
        );
      }
    }
  });
}

export function replaceAllPersonalTrackRecords(records: PersonalTrackRecord[]) {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM personal_track_daf');
    const now = new Date().toISOString();
    for (const r of records) {
      db.runSync(
        'INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt, stop_point) VALUES (?, ?, ?, ?, ?, ?)',
        [r.masechet, r.daf_num, r.status, r.amud ?? null, r.learnedAt || now, r.stop_point ?? null]
      );
    }
  });
}

export function mergePersonalTrackRecords(records: PersonalTrackRecord[]) {
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    const existingPersonal = new Map(
      getPersonalTrackRecords().map((record) => [`${record.masechet}_${record.daf_num}`, record]),
    );
    for (const r of records) {
      const key = `${r.masechet}_${r.daf_num}`;
      const existing = existingPersonal.get(key);
      if (!existing) {
        db.runSync(
          'INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt, stop_point) VALUES (?, ?, ?, ?, ?, ?)',
          [r.masechet, r.daf_num, r.status, r.amud ?? null, r.learnedAt || now, r.stop_point ?? null]
        );
        existingPersonal.set(key, {
          id: -1,
          masechet: r.masechet,
          daf_num: r.daf_num,
          status: r.status,
          amud: r.amud ?? null,
          learnedAt: r.learnedAt || now,
          stop_point: r.stop_point ?? null,
        });
      } else {
        const existingTime = Date.parse(existing.learnedAt);
        const incomingTime = Date.parse(r.learnedAt);
        const incomingWins =
          Number.isFinite(incomingTime) &&
          (!Number.isFinite(existingTime) || incomingTime >= existingTime);
        if (incomingWins) {
          db.runSync(
            'UPDATE personal_track_daf SET status = ?, amud = ?, learnedAt = ?, stop_point = ? WHERE masechet = ? AND daf_num = ?',
            [r.status, r.amud ?? null, r.learnedAt || now, r.stop_point ?? null, r.masechet, r.daf_num]
          );
          existingPersonal.set(key, {
            ...existing,
            status: r.status,
            amud: r.amud ?? null,
            learnedAt: r.learnedAt || now,
            stop_point: r.stop_point ?? null,
          });
        }
      }
    }
  });
}

export function resetPersonalTrackRecords() {
  db.execSync('DELETE FROM personal_track_daf;');
  db.runSync(
    "UPDATE settings SET active_personal_masechet = NULL, pinned_personal_masechtot = '[]' WHERE id = 1;",
  );
}
