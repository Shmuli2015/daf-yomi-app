jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('../connection', () => ({
  db: {
    execSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    runSync: jest.fn(),
    withTransactionSync: jest.fn((cb: () => void) => cb()),
  },
}));

jest.mock('../dailyRecords', () => ({
  getAllRecords: jest.fn(() => []),
}));

jest.mock('../personalTrack', () => ({
  getPersonalTrackRecords: jest.fn(() => []),
}));

jest.mock('../migrations', () => ({
  migrateDailyDafColumns: jest.fn(),
  migratePersonalTrackColumns: jest.fn(),
}));

import { db } from '../connection';
import { getAllRecords } from '../dailyRecords';
import {
  importFullBackupTransaction,
  importRecords,
  importSettingsFromBackup,
  replaceAllRecords,
} from '../importBackup';
import { getPersonalTrackRecords } from '../personalTrack';
import type { DailyRecord, DailyRecordInput, SettingsInput } from '../types';
import { clampReaderFontSize } from '../../utils/readerFontSize';
import { serializePinnedPersonalMasechtot } from '../../utils/pinnedPersonalMasechtot';

function settingsInput(overrides: Partial<SettingsInput> = {}): SettingsInput {
  return {
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
    pinned_personal_masechtot: null,
    show_personal_track_banner: 1,
    reader_font_size: 18,
    seen_app_version: null,
    reader_view_mode: 'classic',
    show_chavruta_notes: 1,
    gemara_nikud: 1,
    haptics_enabled: 1,
    keep_screen_awake: 1,
    last_backup_at: null,
    notification_sound_enabled: 1,
    notification_opens_daf: 0,
    daf_day_start_mode: 'midnight',
    daf_day_start_hour: 20,
    daf_day_start_minute: 0,
    daf_day_start_schedules: null,
    last_store_review_prompt_at: null,
    store_review_streak7_prompted: 0,
    reader_theme: 'system',
    auto_backup_enabled: 0,
    auto_backup_interval: 'weekly',
    auto_backup_file_uri: null,
    auto_backup_previous_file_uri: null,
    auto_backup_directory_uri: null,
    auto_backup_failed: 0,
    auto_backup_issue: null,
    ...overrides,
  };
}

function dailyInput(overrides: Partial<DailyRecordInput> = {}): DailyRecordInput {
  return {
    date: '2026-01-15',
    masechet: 'ברכות',
    daf: "דף ב'",
    status: 'learned',
    percentage: 100,
    amud: null,
    learnedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}

function existingDaily(overrides: Partial<DailyRecord> = {}): DailyRecord {
  return {
    id: 1,
    ...dailyInput(),
    ...overrides,
  };
}

function runSql(): string[] {
  return (db.runSync as jest.Mock).mock.calls.map((call) => String(call[0]));
}

describe('importBackup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAllRecords as jest.Mock).mockReturnValue([]);
    (getPersonalTrackRecords as jest.Mock).mockReturnValue([]);
    (db.getFirstSync as jest.Mock).mockReturnValue(null);
    (db.withTransactionSync as jest.Mock).mockImplementation((cb: () => void) => cb());
  });

  it('replaceAllRecords deletes daily_daf then inserts each record', () => {
    const incoming = dailyInput();
    replaceAllRecords([incoming]);

    expect(db.withTransactionSync).toHaveBeenCalledTimes(1);
    expect(runSql()).toEqual([
      'DELETE FROM daily_daf',
      'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ]);
    expect(db.runSync).toHaveBeenCalledWith(
      'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        incoming.date,
        incoming.masechet,
        incoming.daf,
        incoming.status,
        incoming.percentage,
        incoming.amud,
        incoming.learnedAt,
      ],
    );
  });

  it('importRecords inserts a missing date', () => {
    const incoming = dailyInput();
    importRecords([incoming]);

    expect(runSql()).toEqual([
      'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ]);
  });

  it('importRecords keeps the newer or equal learnedAt and rejects older or invalid incoming dates', () => {
    const existing = existingDaily({
      status: 'missed',
      percentage: 0,
      learnedAt: '2020-01-01T00:00:00.000Z',
    });
    (getAllRecords as jest.Mock).mockReturnValue([existing]);

    importRecords([
      dailyInput({
        status: 'learned',
        percentage: 100,
        learnedAt: '2021-01-01T00:00:00.000Z',
      }),
    ]);
    expect(db.runSync).toHaveBeenCalledWith(
      'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
      ['ברכות', "דף ב'", 'learned', 100, null, '2021-01-01T00:00:00.000Z', '2026-01-15'],
    );

    jest.clearAllMocks();
    (getAllRecords as jest.Mock).mockReturnValue([existing]);
    importRecords([
      dailyInput({
        status: 'learned',
        learnedAt: '2019-01-01T00:00:00.000Z',
      }),
    ]);
    expect(db.runSync).toHaveBeenCalledWith(
      'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
      ['ברכות', "דף ב'", 'missed', 0, null, '2020-01-01T00:00:00.000Z', '2026-01-15'],
    );

    jest.clearAllMocks();
    (getAllRecords as jest.Mock).mockReturnValue([existing]);
    importRecords([dailyInput({ status: 'learned', learnedAt: 'not-a-date' })]);
    expect(db.runSync).toHaveBeenCalledWith(
      'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
      ['ברכות', "דף ב'", 'missed', 0, null, '2020-01-01T00:00:00.000Z', '2026-01-15'],
    );
  });

  it('replace mode wipes daily and personal tables then writes settings', () => {
    importFullBackupTransaction(
      {
        records: [dailyInput()],
        settings: settingsInput({ theme_mode: 'dark' }),
        personalTrackRecords: [
          { masechet: 'Berakhot', daf_num: 2, status: 'learned', learnedAt: '2026-01-01T00:00:00.000Z' },
        ],
      },
      'replace',
    );

    const sql = runSql();
    expect(sql).toContain('DELETE FROM daily_daf');
    expect(sql).toContain('DELETE FROM personal_track_daf');
    expect(sql.some((statement) => statement.includes('UPDATE settings SET'))).toBe(true);
    expect(sql.some((statement) => statement.includes('INSERT INTO daily_daf'))).toBe(true);
    expect(sql.some((statement) => statement.includes('INSERT INTO personal_track_daf'))).toBe(true);
  });

  it('merge mode does not delete tables or overwrite unrelated settings and unions pins', () => {
    (db.getFirstSync as jest.Mock).mockReturnValue({
      pinned_personal_masechtot: '["Berakhot"]',
      active_personal_masechet: 'Berakhot',
    });

    importFullBackupTransaction(
      {
        records: [dailyInput()],
        settings: settingsInput({
          theme_mode: 'dark',
          pinned_personal_masechtot: '["Shabbat"]',
          active_personal_masechet: 'Shabbat',
          show_personal_track_banner: 0,
        }),
        personalTrackRecords: [
          { masechet: 'Shabbat', daf_num: 3, status: 'learned', learnedAt: '2026-02-01T00:00:00.000Z' },
        ],
      },
      'merge',
    );

    const sql = runSql();
    expect(sql).not.toContain('DELETE FROM daily_daf');
    expect(sql).not.toContain('DELETE FROM personal_track_daf');
    expect(sql.some((statement) => statement.includes('notification_hour'))).toBe(false);
    expect(db.runSync).toHaveBeenCalledWith(
      'UPDATE settings SET pinned_personal_masechtot = ?, active_personal_masechet = ? WHERE id = 1',
      [serializePinnedPersonalMasechtot(['Berakhot', 'Shabbat']), 'Berakhot'],
    );
    expect(db.runSync).toHaveBeenCalledWith(
      'UPDATE settings SET show_personal_track_banner = ? WHERE id = 1',
      [0],
    );
  });

  it('importSettingsFromBackup clamps font size, view mode, daf-day start, and notification_opens_daf', () => {
    importSettingsFromBackup(
      settingsInput({
        reader_font_size: 8,
        reader_view_mode: 'pdf',
        daf_day_start_hour: 3,
        daf_day_start_minute: 99,
        notification_opens_daf: 2,
      }),
    );

    const args = (db.runSync as jest.Mock).mock.calls[0][1] as unknown[];
    expect(args[17]).toBe(clampReaderFontSize(8));
    expect(args[19]).toBe('classic');
    expect(args[25]).toBe(0);
    expect(args[27]).toBe(14);
    expect(args[28]).toBe(0);
  });
});
