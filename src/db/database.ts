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
  show_secular_date: number;
  show_confetti: number;
  notifications_enabled: number;
  notif_mode: string;
  day_schedules: string | null;
  theme_mode: string;
  last_update_check_at: string | null;
  dismissed_update_version: string | null;
  /** 1 = show update modal when a newer version is detected (startup / foreground) */
  update_auto_prompt_enabled: number;
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
      notification_minute INTEGER DEFAULT 30
    );
  `);

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

  db.execSync(`
    INSERT OR IGNORE INTO settings (id, notification_hour, notification_minute)
    VALUES (1, 7, 30);
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

export function batchUpdateDailyRecords(
  updates: Array<{ dateStr: string; masechet: string; daf: string; status: 'learned' | 'missed' }>
) {
  db.withTransactionSync(() => {
    const now = new Date().toISOString();
    for (const { dateStr, masechet, daf, status } of updates) {
      const existing = getDailyRecord(dateStr);
      if (existing) {
        db.runSync(
          'UPDATE daily_daf SET status = ?, learnedAt = ? WHERE date = ?',
          [status, now, dateStr]
        );
      } else {
        db.runSync(
          'INSERT INTO daily_daf (date, masechet, daf, status, learnedAt) VALUES (?, ?, ?, ?, ?)',
          [dateStr, masechet, daf, status, now]
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

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS daily_daf;');
  initDB();
}
