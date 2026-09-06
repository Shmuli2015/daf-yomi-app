import * as SQLite from 'expo-sqlite';
import { HALF_DAF_TIP_VERSION } from '../constants/halfDafTip';

const db = SQLite.openDatabaseSync('dafYomi.db');

export interface DailyRecord {
  id: number;
  date: string;
  masechet: string;
  daf: string;
  status: 'learned' | 'partial' | 'missed';
  percentage: number;
  amud: 'a' | 'b' | null;
  learnedAt: string;
}

export interface PersonalTrackRecord {
  id?: number;
  masechet: string;
  daf_num: number;
  status: 'learned' | 'partial';
  learnedAt: string;
}

export interface SettingsRecord {
  id: number;
  notification_hour: number;
  notification_minute: number;
  show_secular_date: number;
  show_confetti: number;
  notifications_enabled: number;
  notif_mode: string;
  day_schedules: string | null;
  theme_mode: string;
  last_update_check_at: string | null;
  dismissed_update_version: string | null;
  update_auto_prompt_enabled: number;
  study_link_mode: string;
  show_calendar_daf: number;
  dismissed_half_daf_tip: number;
  active_personal_masechet: string | null;
  show_personal_track_banner: number;
}

function migrateDailyDafColumns() {
  const dailyDafInfo: { name: string }[] = db.getAllSync('PRAGMA table_info(daily_daf);');
  const dailyDafColumns = dailyDafInfo.map(c => c.name);

  if (!dailyDafColumns.includes('percentage')) {
    db.execSync('ALTER TABLE daily_daf ADD COLUMN percentage INTEGER DEFAULT 0;');
  }
  if (!dailyDafColumns.includes('amud')) {
    db.execSync('ALTER TABLE daily_daf ADD COLUMN amud TEXT DEFAULT NULL;');
  }
  if (dailyDafColumns.includes('notes')) {
    db.execSync('ALTER TABLE daily_daf DROP COLUMN notes;');
  }
}

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS daily_daf (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      masechet TEXT,
      daf TEXT,
      status TEXT,
      percentage INTEGER DEFAULT 0,
      learnedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS personal_track_daf (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      masechet TEXT NOT NULL,
      daf_num INTEGER NOT NULL,
      status TEXT NOT NULL,
      learnedAt TEXT,
      UNIQUE(masechet, daf_num)
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      notification_hour INTEGER DEFAULT 7,
      notification_minute INTEGER DEFAULT 30
    );
  `);

  migrateDailyDafColumns();

  const tableInfo: any[] = db.getAllSync('PRAGMA table_info(settings);');
  const columns = tableInfo.map(c => c.name);
  
  if (!columns.includes('show_secular_date')) {
    db.execSync('ALTER TABLE settings ADD COLUMN show_secular_date INTEGER DEFAULT 1;');
  }
  if (!columns.includes('show_confetti')) {
    db.execSync('ALTER TABLE settings ADD COLUMN show_confetti INTEGER DEFAULT 1;');
  }
  if (!columns.includes('notifications_enabled')) {
    db.execSync('ALTER TABLE settings ADD COLUMN notifications_enabled INTEGER DEFAULT 1;');
  }
  if (!columns.includes('notif_mode')) {
    db.execSync("ALTER TABLE settings ADD COLUMN notif_mode TEXT DEFAULT 'daily';");
  }
  if (!columns.includes('day_schedules')) {
    db.execSync('ALTER TABLE settings ADD COLUMN day_schedules TEXT DEFAULT NULL;');
  }
  if (!columns.includes('theme_mode')) {
    db.execSync("ALTER TABLE settings ADD COLUMN theme_mode TEXT DEFAULT 'system';");
  }
  if (!columns.includes('last_update_check_at')) {
    db.execSync('ALTER TABLE settings ADD COLUMN last_update_check_at TEXT DEFAULT NULL;');
  }
  if (!columns.includes('dismissed_update_version')) {
    db.execSync('ALTER TABLE settings ADD COLUMN dismissed_update_version TEXT DEFAULT NULL;');
  }
  if (!columns.includes('update_auto_prompt_enabled')) {
    db.execSync('ALTER TABLE settings ADD COLUMN update_auto_prompt_enabled INTEGER DEFAULT 0;');
  }
  if (!columns.includes('study_link_mode')) {
    db.execSync("ALTER TABLE settings ADD COLUMN study_link_mode TEXT DEFAULT 'both';");
  }
  if (!columns.includes('show_calendar_daf')) {
    db.execSync('ALTER TABLE settings ADD COLUMN show_calendar_daf INTEGER DEFAULT 0;');
  }
  if (!columns.includes('dismissed_half_daf_tip')) {
    db.execSync('ALTER TABLE settings ADD COLUMN dismissed_half_daf_tip INTEGER DEFAULT 0;');
  }
  if (!columns.includes('active_personal_masechet')) {
    db.execSync('ALTER TABLE settings ADD COLUMN active_personal_masechet TEXT DEFAULT NULL;');
  }
  if (!columns.includes('show_personal_track_banner')) {
    db.execSync('ALTER TABLE settings ADD COLUMN show_personal_track_banner INTEGER DEFAULT 1;');
  }

  db.execSync(`
    INSERT OR IGNORE INTO settings (id, notification_hour, notification_minute)
    VALUES (1, 7, 30);
  `);
}

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
  const existing = getDailyRecord(dateStr);
  if (existing) {
    db.runSync(
      'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
      [masechet, daf, status, pct, amudValue, learnedAt, dateStr]
    );
  } else {
    db.runSync(
      'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dateStr, masechet, daf, status, pct, amudValue, learnedAt]
    );
  }
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
      const existing = getDailyRecord(dateStr);
      if (existing) {
        db.runSync(
          'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
          [masechet, daf, status, pct, amudValue, now, dateStr]
        );
      } else {
        db.runSync(
          'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [dateStr, masechet, daf, status, pct, amudValue, now]
        );
      }
    }
  });
}

export function getAllRecords(): DailyRecord[] {
  return db.getAllSync('SELECT * FROM daily_daf ORDER BY date DESC') as DailyRecord[];
}

export function getSettings(): SettingsRecord {
  return db.getFirstSync('SELECT * FROM settings WHERE id = 1') as SettingsRecord;
}

export function updateSettings(
  hour: number,
  minute: number,
  showSecular: boolean,
  showConfetti: boolean,
  notificationsEnabled: boolean,
  notifMode: string = 'daily',
  daySchedules: string | null = null
) {
  db.runSync(
    'UPDATE settings SET notification_hour = ?, notification_minute = ?, show_secular_date = ?, show_confetti = ?, notifications_enabled = ?, notif_mode = ?, day_schedules = ? WHERE id = 1',
    [hour, minute, showSecular ? 1 : 0, showConfetti ? 1 : 0, notificationsEnabled ? 1 : 0, notifMode, daySchedules]
  );
}

export function updateThemeMode(themeMode: string) {
  db.runSync('UPDATE settings SET theme_mode = ? WHERE id = 1', [themeMode]);
}

export function updateStudyLinkMode(mode: string) {
  db.runSync('UPDATE settings SET study_link_mode = ? WHERE id = 1', [mode]);
}

export function touchLastUpdateCheckAt() {
  db.runSync('UPDATE settings SET last_update_check_at = ? WHERE id = 1', [
    new Date().toISOString(),
  ]);
}

export function setDismissedUpdateVersion(version: string | null) {
  db.runSync('UPDATE settings SET dismissed_update_version = ? WHERE id = 1', [version]);
}

export function setUpdateAutoPromptEnabled(enabled: boolean) {
  db.runSync('UPDATE settings SET update_auto_prompt_enabled = ? WHERE id = 1', [
    enabled ? 1 : 0,
  ]);
}

export function setShowCalendarDaf(enabled: boolean) {
  db.runSync('UPDATE settings SET show_calendar_daf = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setDismissedHalfDafTip(version: number = HALF_DAF_TIP_VERSION) {
  db.runSync('UPDATE settings SET dismissed_half_daf_tip = ? WHERE id = 1', [version]);
}

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS daily_daf;');
  initDB();
}

export type DailyRecordInput = Omit<DailyRecord, 'id'>;
export type SettingsInput = Omit<SettingsRecord, 'id'>;

function insertDailyRecord(record: DailyRecordInput) {
  db.runSync(
    'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      record.date,
      record.masechet,
      record.daf,
      record.status,
      record.percentage ?? 0,
      record.amud ?? null,
      record.learnedAt,
    ]
  );
}

function updateDailyRecordFromBackup(record: DailyRecordInput) {
  db.runSync(
    'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
    [
      record.masechet,
      record.daf,
      record.status,
      record.percentage ?? 0,
      record.amud ?? null,
      record.learnedAt,
      record.date,
    ]
  );
}

export function replaceAllRecords(records: DailyRecordInput[]) {
  migrateDailyDafColumns();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM daily_daf');
    for (const record of records) {
      insertDailyRecord(record);
    }
  });
}

export function importRecords(records: DailyRecordInput[]) {
  migrateDailyDafColumns();
  db.withTransactionSync(() => {
    for (const incoming of records) {
      const existing = getDailyRecord(incoming.date);
      if (!existing) {
        insertDailyRecord(incoming);
        continue;
      }

      const existingTime = Date.parse(existing.learnedAt);
      const incomingTime = Date.parse(incoming.learnedAt);
      const winner =
        Number.isFinite(incomingTime) &&
        (!Number.isFinite(existingTime) || incomingTime >= existingTime)
          ? incoming
          : {
              date: existing.date,
              masechet: existing.masechet,
              daf: existing.daf,
              status: existing.status,
              percentage: existing.percentage,
              amud: existing.amud,
              learnedAt: existing.learnedAt,
            };

      updateDailyRecordFromBackup(winner);
    }
  });
}

export function importSettingsFromBackup(settings: SettingsInput) {
  db.runSync(
    `UPDATE settings SET
      notification_hour = ?,
      notification_minute = ?,
      show_secular_date = ?,
      show_confetti = ?,
      notifications_enabled = ?,
      notif_mode = ?,
      day_schedules = ?,
      theme_mode = ?,
      last_update_check_at = ?,
      dismissed_update_version = ?,
      update_auto_prompt_enabled = ?,
      study_link_mode = ?,
      show_calendar_daf = ?,
      dismissed_half_daf_tip = ?,
      active_personal_masechet = ?,
      show_personal_track_banner = ?
    WHERE id = 1`,
    [
      settings.notification_hour,
      settings.notification_minute,
      settings.show_secular_date,
      settings.show_confetti,
      settings.notifications_enabled,
      settings.notif_mode,
      settings.day_schedules,
      settings.theme_mode,
      settings.last_update_check_at,
      settings.dismissed_update_version,
      settings.update_auto_prompt_enabled,
      settings.study_link_mode,
      settings.show_calendar_daf,
      settings.dismissed_half_daf_tip,
      settings.active_personal_masechet,
      settings.show_personal_track_banner,
    ]
  );
}

export function getPersonalTrackRecords(masechet?: string): PersonalTrackRecord[] {
  if (masechet) {
    return db.getAllSync('SELECT * FROM personal_track_daf WHERE masechet = ? ORDER BY daf_num ASC', [masechet]) as PersonalTrackRecord[];
  }
  return db.getAllSync('SELECT * FROM personal_track_daf ORDER BY daf_num ASC') as PersonalTrackRecord[];
}

export function updatePersonalTrackRecord(masechet: string, dafNum: number, status: 'learned' | 'partial' | 'none') {
  const now = new Date().toISOString();
  if (status === 'none') {
    db.runSync('DELETE FROM personal_track_daf WHERE masechet = ? AND daf_num = ?', [masechet, dafNum]);
  } else {
    const existing = db.getFirstSync('SELECT id FROM personal_track_daf WHERE masechet = ? AND daf_num = ?', [masechet, dafNum]);
    if (existing) {
      db.runSync('UPDATE personal_track_daf SET status = ?, learnedAt = ? WHERE masechet = ? AND daf_num = ?', [status, now, masechet, dafNum]);
    } else {
      db.runSync('INSERT INTO personal_track_daf (masechet, daf_num, status, learnedAt) VALUES (?, ?, ?, ?)', [masechet, dafNum, status, now]);
    }
  }
}

export function setActivePersonalMasechet(masechetEn: string | null) {
  db.runSync('UPDATE settings SET active_personal_masechet = ? WHERE id = 1', [masechetEn]);
}

export function replaceAllPersonalTrackRecords(records: PersonalTrackRecord[]) {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM personal_track_daf');
    const now = new Date().toISOString();
    for (const r of records) {
      db.runSync(
        'INSERT INTO personal_track_daf (masechet, daf_num, status, learnedAt) VALUES (?, ?, ?, ?)',
        [r.masechet, r.daf_num, r.status, r.learnedAt || now]
      );
    }
  });
}

export function setShowPersonalTrackBanner(enabled: boolean) {
  db.runSync('UPDATE settings SET show_personal_track_banner = ? WHERE id = 1', [enabled ? 1 : 0]);
}

