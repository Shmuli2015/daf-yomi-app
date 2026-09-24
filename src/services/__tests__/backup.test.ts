jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Share: { share: jest.fn() },
}));
jest.mock('../../utils/shareProgressImage', () => ({
  toFileSharingUrl: jest.fn(),
}));
jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.1.6' },
}));
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system', () => ({
  Directory: { pickDirectoryAsync: jest.fn() },
}));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/',
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: { UTF8: 'utf8' },
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn(),
}));
jest.mock('../../db/database', () => ({
  getAllRecords: jest.fn().mockReturnValue([]),
  getSettings: jest.fn().mockReturnValue({}),
  getPersonalTrackRecords: jest.fn().mockReturnValue([]),
}));

import {
  parseBackupJson,
  MAX_BACKUP_SIZE_BYTES,
  CURRENT_BACKUP_VERSION,
  type BackupData,
} from '../backup';

describe('backup security and validation', () => {
  const validBackup: BackupData = {
    backupVersion: CURRENT_BACKUP_VERSION,
    exportedAt: '2026-09-24T12:00:00.000Z',
    appVersion: '1.1.6',
    records: [
      {
        date: '2026-09-24',
        masechet: 'ברכות',
        daf: 'ב',
        status: 'learned',
        percentage: 100,
        amud: 'a',
        learnedAt: '2026-09-24T12:30:00.000Z',
      },
    ],
    settings: {
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
      reader_font_size: 18,
      seen_app_version: null,
      reader_view_mode: 'classic',
      show_chavruta_notes: 1,
      gemara_nikud: 1,
      haptics_enabled: 1,
      keep_screen_awake: 1,
      last_backup_at: null,
      notification_sound_enabled: 1,
      daf_day_start_mode: 'midnight',
      daf_day_start_hour: 20,
      daf_day_start_minute: 0,
      daf_day_start_schedules: null,
      last_store_review_prompt_at: null,
      store_review_streak7_prompted: 0,
      reader_theme: 'system',
    },
    personalTrackRecords: [
      {
        masechet: 'ברכות',
        daf_num: 2,
        status: 'learned',
        amud: 'a',
        learnedAt: '2026-09-24T12:30:00.000Z',
      },
    ],
  };

  it('parses valid backup data successfully', () => {
    const json = JSON.stringify(validBackup);
    const result = parseBackupJson(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.records.length).toBe(1);
      expect(result.data.records[0].date).toBe('2026-09-24');
      expect(result.data.personalTrackRecords?.length).toBe(1);
    }
  });

  it('rejects oversized JSON input above MAX_BACKUP_SIZE_BYTES', () => {
    const bigString = 'a'.repeat(MAX_BACKUP_SIZE_BYTES + 1);
    const result = parseBackupJson(bigString);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('גדול מדי');
    }
  });

  it('rejects invalid JSON syntax', () => {
    const result = parseBackupJson('{ not valid json');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('פורמט JSON');
    }
  });

  it('rejects records with invalid date format', () => {
    const invalidData = {
      ...validBackup,
      records: [
        {
          ...validBackup.records[0],
          date: '<script>alert(1)</script>',
        },
      ],
    };
    const result = parseBackupJson(JSON.stringify(invalidData));
    expect(result.ok).toBe(false);
  });

  it('rejects records with overly long strings', () => {
    const invalidData = {
      ...validBackup,
      records: [
        {
          ...validBackup.records[0],
          masechet: 'x'.repeat(150),
        },
      ],
    };
    const result = parseBackupJson(JSON.stringify(invalidData));
    expect(result.ok).toBe(false);
  });

  it('rejects personal track records with non-integer or out-of-range daf numbers', () => {
    const invalidData = {
      ...validBackup,
      personalTrackRecords: [
        {
          masechet: 'ברכות',
          daf_num: 99999,
          status: 'learned' as const,
          learnedAt: '2026-09-24T12:30:00.000Z',
        },
      ],
    };
    const result = parseBackupJson(JSON.stringify(invalidData));
    expect(result.ok).toBe(false);
  });

  it('rejects records with invalid status', () => {
    const invalidData = {
      ...validBackup,
      records: [
        {
          ...validBackup.records[0],
          status: 'hacked_status',
        },
      ],
    };
    const result = parseBackupJson(JSON.stringify(invalidData));
    expect(result.ok).toBe(false);
  });

  it('rejects higher future backup versions', () => {
    const futureData = {
      ...validBackup,
      backupVersion: 999,
    };
    const result = parseBackupJson(JSON.stringify(futureData));
    expect(result.ok).toBe(false);
  });
});
