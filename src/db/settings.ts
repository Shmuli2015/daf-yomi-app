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
import { db } from './connection';
import { ensureReaderFontSizeColumn, getSettingsColumnNames } from './migrations';
import type { SettingsRecord } from './types';

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
    gemara_nikud: 1,
    haptics_enabled: 1,
    keep_screen_awake: 1,
    last_backup_at: null,
    notification_sound_enabled: 1,
    daf_day_start_mode: 'midnight',
    daf_day_start_hour: DAF_DAY_START_DEFAULT_HOUR,
    daf_day_start_minute: DAF_DAY_START_DEFAULT_MINUTE,
    daf_day_start_schedules: null,
    last_store_review_prompt_at: null,
    store_review_streak7_prompted: 0,
    reader_theme: 'system',
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
    gemara_nikud: row.gemara_nikud === 0 ? 0 : 1,
    haptics_enabled: row.haptics_enabled === 0 ? 0 : 1,
    keep_screen_awake: row.keep_screen_awake === 0 ? 0 : 1,
    notification_sound_enabled: row.notification_sound_enabled === 0 ? 0 : 1,
    daf_day_start_mode: normalizeDafDayStartMode(row.daf_day_start_mode),
    daf_day_start_hour: clampedStart.hour,
    daf_day_start_minute: clampedStart.minute,
    daf_day_start_schedules: JSON.stringify(schedules),
    store_review_streak7_prompted: row.store_review_streak7_prompted === 1 ? 1 : 0,
    reader_theme: row.reader_theme || 'system',
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

export function updateReaderTheme(theme: string) {
  if (!getSettingsColumnNames().includes('reader_theme')) {
    db.execSync("ALTER TABLE settings ADD COLUMN reader_theme TEXT DEFAULT 'system';");
  }
  db.runSync('UPDATE settings SET reader_theme = ? WHERE id = 1', [theme]);
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

export function setGemaraNikud(enabled: boolean) {
  db.runSync('UPDATE settings SET gemara_nikud = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setHapticsEnabled(enabled: boolean) {
  db.runSync('UPDATE settings SET haptics_enabled = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setKeepScreenAwake(enabled: boolean) {
  db.runSync('UPDATE settings SET keep_screen_awake = ? WHERE id = 1', [enabled ? 1 : 0]);
}

export function setLastBackupAt(iso: string) {
  db.runSync('UPDATE settings SET last_backup_at = ? WHERE id = 1', [iso]);
}

export function markStoreReviewPrompted(reason: 'siyum' | 'streak7') {
  if (reason === 'streak7') {
    db.runSync(
      'UPDATE settings SET last_store_review_prompt_at = ?, store_review_streak7_prompted = 1 WHERE id = 1',
      [new Date().toISOString()],
    );
    return;
  }
  db.runSync('UPDATE settings SET last_store_review_prompt_at = ? WHERE id = 1', [
    new Date().toISOString(),
  ]);
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

export function setActivePersonalMasechet(masechetEn: string | null) {
  db.runSync('UPDATE settings SET active_personal_masechet = ? WHERE id = 1', [masechetEn]);
}

export function setShowPersonalTrackBanner(enabled: boolean) {
  db.runSync('UPDATE settings SET show_personal_track_banner = ? WHERE id = 1', [enabled ? 1 : 0]);
}
