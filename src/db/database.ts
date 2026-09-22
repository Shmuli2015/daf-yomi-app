import * as SQLite from 'expo-sqlite';
import { HALF_DAF_TIP_VERSION } from '../constants/halfDafTip';
import {
  clampDafDayStartTime,
  DAF_DAY_START_DEFAULT_HOUR,
  DAF_DAY_START_DEFAULT_MINUTE,
  normalizeDafDayStartMode,
  parseDafDayStartSchedules,
  schedulesFromSingleTime,
  type DafDayStartDaySchedule,
} from '../utils/dafDayBoundary';
import { clampReaderFontSize, READER_FONT_SIZE_DEFAULT } from '../utils/readerFontSize';
import { clampReaderViewMode, READER_VIEW_MODE_DEFAULT } from '../utils/readerViewMode';

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
  amud?: 'a' | 'b' | null;
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
  reader_font_size: number;
  seen_app_version: string | null;
  reader_view_mode: string;
  show_chavruta_notes: number;
  haptics_enabled: number;
  last_backup_at: string | null;
  notification_sound_enabled: number;
  daf_day_start_mode: string;
  daf_day_start_hour: number;
  daf_day_start_minute: number;
  daf_day_start_schedules: string | null;
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

function migratePersonalTrackColumns() {
  const personalDafInfo: { name: string }[] = db.getAllSync('PRAGMA table_info(personal_track_daf);');
  const personalDafColumns = personalDafInfo.map(c => c.name);

  if (!personalDafColumns.includes('amud')) {
    db.execSync('ALTER TABLE personal_track_daf ADD COLUMN amud TEXT DEFAULT NULL;');
  }
}

function getSettingsColumnNames(): string[] {
  const tableInfo: { name: string }[] = db.getAllSync('PRAGMA table_info(settings);');
  return tableInfo.map((column) => column.name);
}

function ensureReaderFontSizeColumn() {
  if (!getSettingsColumnNames().includes('reader_font_size')) {
    db.execSync('ALTER TABLE settings ADD COLUMN reader_font_size INTEGER DEFAULT 18;');
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
    CREATE INDEX IF NOT EXISTS idx_daily_daf_status ON daily_daf(status);
    CREATE INDEX IF NOT EXISTS idx_personal_track_status ON personal_track_daf(status);
  `);

  migrateDailyDafColumns();
  migratePersonalTrackColumns();

  const columns = getSettingsColumnNames();
  
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
    db.execSync('ALTER TABLE settings ADD COLUMN update_auto_prompt_enabled INTEGER DEFAULT 1;');
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
  if (!columns.includes('reader_font_size')) {
    db.execSync('ALTER TABLE settings ADD COLUMN reader_font_size INTEGER DEFAULT 18;');
  }
  if (!columns.includes('seen_app_version')) {
    db.execSync('ALTER TABLE settings ADD COLUMN seen_app_version TEXT DEFAULT NULL;');
  }
  if (!columns.includes('reader_view_mode')) {
    db.execSync(`ALTER TABLE settings ADD COLUMN reader_view_mode TEXT DEFAULT '${READER_VIEW_MODE_DEFAULT}';`);
  }
  if (!columns.includes('show_chavruta_notes')) {
    db.execSync('ALTER TABLE settings ADD COLUMN show_chavruta_notes INTEGER DEFAULT 1;');
  }
  if (!columns.includes('haptics_enabled')) {
    db.execSync('ALTER TABLE settings ADD COLUMN haptics_enabled INTEGER DEFAULT 1;');
  }
  if (!columns.includes('last_backup_at')) {
    db.execSync('ALTER TABLE settings ADD COLUMN last_backup_at TEXT DEFAULT NULL;');
  }
  if (!columns.includes('notification_sound_enabled')) {
    db.execSync('ALTER TABLE settings ADD COLUMN notification_sound_enabled INTEGER DEFAULT 1;');
  }
  if (!columns.includes('daf_day_start_mode')) {
    db.execSync("ALTER TABLE settings ADD COLUMN daf_day_start_mode TEXT DEFAULT 'midnight';");
  }
  if (!columns.includes('daf_day_start_hour')) {
    db.execSync('ALTER TABLE settings ADD COLUMN daf_day_start_hour INTEGER DEFAULT 20;');
  }
  if (!columns.includes('daf_day_start_minute')) {
    db.execSync('ALTER TABLE settings ADD COLUMN daf_day_start_minute INTEGER DEFAULT 0;');
  }
  if (!columns.includes('daf_day_start_schedules')) {
    db.execSync('ALTER TABLE settings ADD COLUMN daf_day_start_schedules TEXT DEFAULT NULL;');
  }

  db.execSync(`
    INSERT OR IGNORE INTO settings (id, notification_hour, notification_minute)
    VALUES (1, 7, 30);
  `);

  enableAutoUpdatePromptByDefault();
}

function enableAutoUpdatePromptByDefault() {
  const pragma = db.getFirstSync('PRAGMA user_version') as { user_version?: number } | number | null;
  const version = typeof pragma === 'number' ? pragma : pragma?.user_version ?? 0;
  if (version >= 1) return;
  db.execSync('UPDATE settings SET update_auto_prompt_enabled = 1 WHERE id = 1');
  db.execSync('PRAGMA user_version = 1');
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

export function getSettings(): SettingsRecord {
  ensureReaderFontSizeColumn();
  let row = db.getFirstSync('SELECT * FROM settings WHERE id = 1') as SettingsRecord | null;
  if (!row) {
    db.runSync(
      'INSERT INTO settings (id, notification_hour, notification_minute, reader_font_size) VALUES (1, 7, 30, ?)',
      [READER_FONT_SIZE_DEFAULT],
    );
    row = db.getFirstSync('SELECT * FROM settings WHERE id = 1') as SettingsRecord | null;
  }
  if (!row) {
    return createDefaultSettingsRecord();
  }
  return normalizeSettingsRecord(row);
}

function createDefaultSettingsRecord(): SettingsRecord {
  return {
    id: 1,
    notification_hour: 7,
    notification_minute: 30,
    show_secular_date: 1,
    show_confetti: 1,
    notifications_enabled: 1,
    notif_mode: 'daily',
    day_schedules: null,
    theme_mode: 'system',
    last_update_check_at: null,
    dismissed_update_version: null,
    update_auto_prompt_enabled: 1,
    study_link_mode: 'both',
    show_calendar_daf: 0,
    dismissed_half_daf_tip: 0,
    active_personal_masechet: null,
    show_personal_track_banner: 1,
    reader_font_size: READER_FONT_SIZE_DEFAULT,
    seen_app_version: null,
    reader_view_mode: READER_VIEW_MODE_DEFAULT,
    show_chavruta_notes: 1,
    haptics_enabled: 1,
    last_backup_at: null,
    notification_sound_enabled: 1,
    daf_day_start_mode: 'midnight',
    daf_day_start_hour: DAF_DAY_START_DEFAULT_HOUR,
    daf_day_start_minute: DAF_DAY_START_DEFAULT_MINUTE,
    daf_day_start_schedules: null,
  };
}

function normalizeSettingsRecord(row: SettingsRecord): SettingsRecord {
  const clampedStart = clampDafDayStartTime(
    Number(row.daf_day_start_hour),
    Number(row.daf_day_start_minute),
  );
  const schedules = parseDafDayStartSchedules(
    row.daf_day_start_schedules,
    clampedStart.hour,
    clampedStart.minute,
  );
  return {
    ...createDefaultSettingsRecord(),
    ...row,
    reader_font_size: clampReaderFontSize(Number(row.reader_font_size)),
    reader_view_mode: clampReaderViewMode(row.reader_view_mode),
    show_chavruta_notes: row.show_chavruta_notes === 0 ? 0 : 1,
    haptics_enabled: row.haptics_enabled === 0 ? 0 : 1,
    notification_sound_enabled: row.notification_sound_enabled === 0 ? 0 : 1,
    daf_day_start_mode: normalizeDafDayStartMode(row.daf_day_start_mode),
    daf_day_start_hour: clampedStart.hour,
    daf_day_start_minute: clampedStart.minute,
    daf_day_start_schedules: JSON.stringify(schedules),
  };
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

export function updateReaderFontSize(size: number) {
  const next = clampReaderFontSize(size);
  ensureReaderFontSizeColumn();
  const result = db.runSync('UPDATE settings SET reader_font_size = ? WHERE id = 1', [next]);
  if (result.changes === 0) {
    db.runSync(
      'INSERT INTO settings (id, notification_hour, notification_minute, reader_font_size) VALUES (1, 7, 30, ?)',
      [next],
    );
  }
}

export function touchLastUpdateCheckAt() {
  db.runSync('UPDATE settings SET last_update_check_at = ? WHERE id = 1', [
    new Date().toISOString(),
  ]);
}

export function setDismissedUpdateVersion(version: string | null) {
  db.runSync('UPDATE settings SET dismissed_update_version = ? WHERE id = 1', [version]);
}

export function setSeenAppVersion(version: string) {
  db.runSync('UPDATE settings SET seen_app_version = ? WHERE id = 1', [version]);
}

export function setUpdateAutoPromptEnabled(enabled: boolean) {
  db.runSync('UPDATE settings SET update_auto_prompt_enabled = ? WHERE id = 1', [
    enabled ? 1 : 0,
  ]);
}

export function setShowCalendarDaf(enabled: boolean) {
  db.runSync('UPDATE settings SET show_calendar_daf = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setShowSecularDate(enabled: boolean) {
  db.runSync('UPDATE settings SET show_secular_date = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setShowConfetti(enabled: boolean) {
  db.runSync('UPDATE settings SET show_confetti = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setReaderViewMode(mode: string) {
  db.runSync('UPDATE settings SET reader_view_mode = ? WHERE id = 1', [clampReaderViewMode(mode)]);
}

export function setShowChavrutaNotes(enabled: boolean) {
  db.runSync('UPDATE settings SET show_chavruta_notes = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setHapticsEnabled(enabled: boolean) {
  db.runSync('UPDATE settings SET haptics_enabled = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setLastBackupAt(iso: string) {
  db.runSync('UPDATE settings SET last_backup_at = ? WHERE id = 1', [iso]);
}

export function setNotificationSoundEnabled(enabled: boolean) {
  db.runSync('UPDATE settings SET notification_sound_enabled = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setDafDayStartMode(mode: string) {
  db.runSync('UPDATE settings SET daf_day_start_mode = ? WHERE id = 1', [
    normalizeDafDayStartMode(mode),
  ]);
}

export function setDafDayStartTime(hour: number, minute: number) {
  const clamped = clampDafDayStartTime(hour, minute);
  db.runSync(
    'UPDATE settings SET daf_day_start_hour = ?, daf_day_start_minute = ? WHERE id = 1',
    [clamped.hour, clamped.minute],
  );
}

export function setDafDayStartSchedules(schedules: DafDayStartDaySchedule[]) {
  const current = getSettings();
  const normalized = parseDafDayStartSchedules(
    schedules,
    current.daf_day_start_hour,
    current.daf_day_start_minute,
  );
  db.runSync('UPDATE settings SET daf_day_start_schedules = ? WHERE id = 1', [
    JSON.stringify(normalized),
  ]);
}

export function ensureDafDayStartSchedulesFromCurrentHour() {
  const raw = db.getFirstSync('SELECT daf_day_start_schedules, daf_day_start_hour, daf_day_start_minute FROM settings WHERE id = 1') as {
    daf_day_start_schedules: string | null;
    daf_day_start_hour: number;
    daf_day_start_minute: number;
  } | null;
  if (raw?.daf_day_start_schedules) return;
  const hour = raw?.daf_day_start_hour ?? DAF_DAY_START_DEFAULT_HOUR;
  const minute = raw?.daf_day_start_minute ?? DAF_DAY_START_DEFAULT_MINUTE;
  db.runSync('UPDATE settings SET daf_day_start_schedules = ? WHERE id = 1', [
    JSON.stringify(schedulesFromSingleTime(hour, minute)),
  ]);
}

export function setDismissedHalfDafTip(version: number = HALF_DAF_TIP_VERSION) {
  db.runSync('UPDATE settings SET dismissed_half_daf_tip = ? WHERE id = 1', [version]);
}

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS daily_daf;');
  db.execSync('DROP TABLE IF EXISTS personal_track_daf;');
  initDB();
}

export function resetDafYomiRecords() {
  db.execSync('DELETE FROM daily_daf;');
}

export function resetPersonalTrackRecords() {
  db.execSync('DELETE FROM personal_track_daf;');
  db.runSync('UPDATE settings SET active_personal_masechet = NULL WHERE id = 1;');
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
  const clampedStart = clampDafDayStartTime(
    settings.daf_day_start_hour,
    settings.daf_day_start_minute,
  );
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
      show_personal_track_banner = ?,
      reader_font_size = ?,
      seen_app_version = ?,
      reader_view_mode = ?,
      show_chavruta_notes = ?,
      haptics_enabled = ?,
      notification_sound_enabled = ?,
      daf_day_start_mode = ?,
      daf_day_start_hour = ?,
      daf_day_start_minute = ?,
      daf_day_start_schedules = ?
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
      clampReaderFontSize(settings.reader_font_size),
      settings.seen_app_version,
      clampReaderViewMode(settings.reader_view_mode),
      settings.show_chavruta_notes === 0 ? 0 : 1,
      settings.haptics_enabled === 0 ? 0 : 1,
      settings.notification_sound_enabled === 0 ? 0 : 1,
      normalizeDafDayStartMode(settings.daf_day_start_mode),
      clampedStart.hour,
      clampedStart.minute,
      JSON.stringify(
        parseDafDayStartSchedules(
          settings.daf_day_start_schedules,
          clampedStart.hour,
          clampedStart.minute,
        ),
      ),
    ]
  );
}

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
  amud?: 'a' | 'b' | null
) {
  migratePersonalTrackColumns();
  const now = new Date().toISOString();
  if (status === 'none') {
    db.runSync('DELETE FROM personal_track_daf WHERE masechet = ? AND daf_num = ?', [masechet, dafNum]);
  } else {
    db.runSync(
      `INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(masechet, daf_num) DO UPDATE SET
         status = excluded.status,
         amud = excluded.amud,
         learnedAt = excluded.learnedAt`,
      [masechet, dafNum, status, amud ?? null, now]
    );
  }
}

export function setActivePersonalMasechet(masechetEn: string | null) {
  db.runSync('UPDATE settings SET active_personal_masechet = ? WHERE id = 1', [masechetEn]);
}

export function replaceAllPersonalTrackRecords(records: PersonalTrackRecord[]) {
  migratePersonalTrackColumns();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM personal_track_daf');
    const now = new Date().toISOString();
    for (const r of records) {
      db.runSync(
        'INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt) VALUES (?, ?, ?, ?, ?)',
        [r.masechet, r.daf_num, r.status, r.amud ?? null, r.learnedAt || now]
      );
    }
  });
}

export function mergePersonalTrackRecords(records: PersonalTrackRecord[]) {
  migratePersonalTrackColumns();
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    for (const r of records) {
      const existing = db.getFirstSync<{ id: number; status: string; learnedAt: string }>(
        'SELECT id, status, learnedAt FROM personal_track_daf WHERE masechet = ? AND daf_num = ?',
        [r.masechet, r.daf_num]
      );
      if (!existing) {
        db.runSync(
          'INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt) VALUES (?, ?, ?, ?, ?)',
          [r.masechet, r.daf_num, r.status, r.amud ?? null, r.learnedAt || now]
        );
      } else {
        const existingTime = Date.parse(existing.learnedAt);
        const incomingTime = Date.parse(r.learnedAt);
        const incomingWins =
          Number.isFinite(incomingTime) &&
          (!Number.isFinite(existingTime) || incomingTime >= existingTime);
        if (incomingWins) {
          db.runSync(
            'UPDATE personal_track_daf SET status = ?, amud = ?, learnedAt = ? WHERE id = ?',
            [r.status, r.amud ?? null, r.learnedAt || now, existing.id]
          );
        }
      }
    }
  });
}

export function setShowPersonalTrackBanner(enabled: boolean) {
  db.runSync('UPDATE settings SET show_personal_track_banner = ? WHERE id = 1', [enabled ? 1 : 0]);
}

