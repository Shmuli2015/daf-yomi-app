import { READER_VIEW_MODE_DEFAULT } from '../utils/readerViewMode';
import { db } from './connection';
import {
  getSettingsColumnNames,
  migrateDailyDafColumns,
  migratePersonalTrackColumns,
} from './migrations';

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
  if (!columns.includes('gemara_nikud')) {
    db.execSync('ALTER TABLE settings ADD COLUMN gemara_nikud INTEGER DEFAULT 1;');
  }
  if (!columns.includes('haptics_enabled')) {
    db.execSync('ALTER TABLE settings ADD COLUMN haptics_enabled INTEGER DEFAULT 1;');
  }
  if (!columns.includes('keep_screen_awake')) {
    db.execSync('ALTER TABLE settings ADD COLUMN keep_screen_awake INTEGER DEFAULT 1;');
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
  if (!columns.includes('last_store_review_prompt_at')) {
    db.execSync('ALTER TABLE settings ADD COLUMN last_store_review_prompt_at TEXT DEFAULT NULL;');
  }
  if (!columns.includes('store_review_streak7_prompted')) {
    db.execSync('ALTER TABLE settings ADD COLUMN store_review_streak7_prompted INTEGER DEFAULT 0;');
  }
  if (!columns.includes('reader_theme')) {
    db.execSync("ALTER TABLE settings ADD COLUMN reader_theme TEXT DEFAULT 'system';");
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

export function resetDB() {
  db.execSync('DROP TABLE IF EXISTS daily_daf;');
  db.execSync('DROP TABLE IF EXISTS personal_track_daf;');
  initDB();
}
