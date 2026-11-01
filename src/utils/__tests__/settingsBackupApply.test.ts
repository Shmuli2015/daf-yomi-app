const mockScheduleNotifications = jest.fn(async () => 0);
const mockCaptureException = jest.fn();

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('../notifications', () => ({
  scheduleNotifications: mockScheduleNotifications,
}));
jest.mock('../../services/sentry', () => ({
  captureException: mockCaptureException,
}));

import type { BackupData } from '../../services/backup';
import { DEFAULT_SCHEDULES } from '../reminderSchedule';
import {
  applyImportedBackup,
  backupImportFeedback,
} from '../settingsBackupApply';

function backupWithSchedules(overrides: {
  notif_mode?: string;
  day_schedules?: string | null;
  notifications_enabled?: number;
}): BackupData {
  return {
    backupVersion: 2,
    exportedAt: '2026-10-31T12:00:00.000Z',
    appVersion: '1.2.5',
    records: [],
    settings: {
      notification_hour: 21,
      notification_minute: 0,
      show_secular_date: 1,
      show_confetti: 1,
      notifications_enabled: overrides.notifications_enabled ?? 1,
      notif_mode: overrides.notif_mode ?? 'custom',
      day_schedules: overrides.day_schedules ?? null,
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
    },
  };
}

describe('applyImportedBackup', () => {
  const importBackup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScheduleNotifications.mockResolvedValue(0);
  });

  it('imports before scheduling on replace', async () => {
    const order: string[] = [];
    importBackup.mockImplementation(() => {
      order.push('import');
    });
    mockScheduleNotifications.mockImplementation(async () => {
      order.push('schedule');
      return 0;
    });
    const backup = backupWithSchedules({
      notif_mode: 'daily',
      day_schedules: null,
    });

    await applyImportedBackup(backup, 'replace', importBackup);

    expect(order).toEqual(['import', 'schedule']);
    expect(importBackup).toHaveBeenCalledWith(backup, 'replace');
  });

  it('does not throw on bad day_schedules json', async () => {
    const backup = backupWithSchedules({
      notif_mode: 'custom',
      day_schedules: '{not-json',
    });

    const result = await applyImportedBackup(backup, 'replace', importBackup);

    expect(result.imported).toBe(true);
    expect(result.feedback).toEqual(backupImportFeedback('replace', false));
    expect(mockScheduleNotifications).toHaveBeenCalledWith(
      21,
      0,
      'custom',
      DEFAULT_SCHEDULES,
      true,
      { sound: true },
    );
  });

  it('schedules default days for custom mode with an empty list', async () => {
    const backup = backupWithSchedules({
      notif_mode: 'custom',
      day_schedules: '[]',
    });

    const result = await applyImportedBackup(backup, 'replace', importBackup);

    expect(result.imported).toBe(true);
    expect(mockScheduleNotifications).toHaveBeenCalledWith(
      21,
      0,
      'custom',
      DEFAULT_SCHEDULES,
      true,
      { sound: true },
    );
    expect(result.feedback.title).toBe('הגיבוי יובא בהצלחה');
    expect(result.feedback.message).toBe('כל הנתונים וההגדרות הוחלפו בגיבוי.');
  });

  it('still reports import success if reminder scheduling fails', async () => {
    mockScheduleNotifications.mockRejectedValueOnce(new Error('notifications unavailable'));
    const backup = backupWithSchedules({
      notif_mode: 'custom',
      day_schedules: '[]',
    });

    const result = await applyImportedBackup(backup, 'replace', importBackup);

    expect(result.imported).toBe(true);
    expect(result.feedback).toEqual(backupImportFeedback('replace', true));
    expect(result.feedback.title).toBe('הגיבוי יובא בהצלחה');
    expect(result.feedback.message).toContain('לא הצלחנו לתזמן מחדש את התזכורות');
    expect(result.feedback.iconName).toBe('alert-circle-outline');
  });

  it('does not reschedule on merge', async () => {
    const backup = backupWithSchedules({ notif_mode: 'custom', day_schedules: '[]' });

    const result = await applyImportedBackup(backup, 'merge', importBackup);

    expect(importBackup).toHaveBeenCalledWith(backup, 'merge');
    expect(mockScheduleNotifications).not.toHaveBeenCalled();
    expect(result.imported).toBe(true);
    expect(result.feedback).toEqual(backupImportFeedback('merge', false));
  });

  it('returns failure feedback when import throws', async () => {
    importBackup.mockImplementation(() => {
      throw new Error('db locked');
    });
    const backup = backupWithSchedules({});

    const result = await applyImportedBackup(backup, 'replace', importBackup);

    expect(result.imported).toBe(false);
    expect(result.feedback.title).toBe('שגיאה בייבוא');
    expect(mockScheduleNotifications).not.toHaveBeenCalled();
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });
});
