import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('dafYomi.db');

export interface DailyRecord {
  id: number;
  date: string;
  masechet: string;
  daf: string;
  status: 'learned' | 'partial' | 'missed';
  percentage: number;
  notes: string;
  learnedAt: string;
}

export interface SettingsRecord {
  id: number;
  notification_hour: number;
  notification_minute: number;
  enable_shabbat_notifications: number;
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
      notes TEXT,
      learnedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      notification_hour INTEGER DEFAULT 7,
      notification_minute INTEGER DEFAULT 30,
      enable_shabbat_notifications INTEGER DEFAULT 0
    );
    INSERT OR IGNORE INTO settings (id, notification_hour, notification_minute, enable_shabbat_notifications)
    VALUES (1, 7, 30, 0);
  `);
}

export function getDailyRecord(dateStr: string): DailyRecord | null {
  return db.getFirstSync('SELECT * FROM daily_daf WHERE date = ?', [dateStr]) as DailyRecord | null;
}

export function updateDailyRecord(dateStr: string, masechet: string, daf: string, status: string) {
  const existing = getDailyRecord(dateStr);
  if (existing) {
    db.runSync(
      'UPDATE daily_daf SET status = ?, learnedAt = ? WHERE date = ?',
      [status, new Date().toISOString(), dateStr]
    );
  } else {
    db.runSync(
      'INSERT INTO daily_daf (date, masechet, daf, status, learnedAt) VALUES (?, ?, ?, ?, ?)',
      [dateStr, masechet, daf, status, new Date().toISOString()]
    );
  }
}

export function getAllRecords(): DailyRecord[] {
  return db.getAllSync('SELECT * FROM daily_daf ORDER BY date DESC') as DailyRecord[];
}

export function getSettings(): SettingsRecord {
  return db.getFirstSync('SELECT * FROM settings WHERE id = 1') as SettingsRecord;
}

export function updateSettings(hour: number, minute: number, shabbat: boolean) {
  db.runSync(
    'UPDATE settings SET notification_hour = ?, notification_minute = ?, enable_shabbat_notifications = ? WHERE id = 1',
    [hour, minute, shabbat ? 1 : 0]
  );
}

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS daily_daf;');
  initDB();
}
