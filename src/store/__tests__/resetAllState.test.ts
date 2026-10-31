const mockResetDB = jest.fn();
const mockGetSettings = jest.fn();
const mockScheduleNotifications = jest.fn(async () => undefined);
const mockCaptureException = jest.fn();

jest.mock('../../db/database', () => {
  const mocks: Record<string, unknown> = {
    __esModule: true,
    resetDB: mockResetDB,
    getSettings: mockGetSettings,
  };
  return new Proxy(mocks, {
    get(target, prop) {
      if (prop in target) return target[prop as string];
      if (typeof prop !== 'string') return undefined;
      const fn = jest.fn();
      target[prop] = fn;
      return fn;
    },
  });
});

jest.mock('../../utils/notifications', () => ({
  scheduleNotifications: mockScheduleNotifications,
  DEFAULT_SCHEDULES: Array.from({ length: 7 }, (_, i) => ({
    enabled: i < 6,
    hour: 7,
    minute: 30,
  })),
}));

jest.mock('../../services/sentry', () => ({
  captureException: mockCaptureException,
}));

import { useAppStore } from '../useAppStore';

const defaultSettings = {
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
};

describe('resetAllState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({ ...defaultSettings });
    useAppStore.setState({
      settings: {
        ...defaultSettings,
        theme_mode: 'dark',
        notification_hour: 21,
        notification_minute: 0,
        daf_day_start_mode: 'custom_hour',
        auto_backup_enabled: 1,
        auto_backup_file_uri: 'content://old-backup',
      },
      history: [
        {
          id: 1,
          date: '2026-01-01',
          masechet: 'ברכות',
          daf: 'ב',
          status: 'learned',
          percentage: 100,
          amud: null,
          learnedAt: '2026-01-01',
        },
      ],
      personalTrackRecords: [
        { masechet: 'Berakhot', daf_num: 2, status: 'learned', learnedAt: '2026-01-01' },
      ],
      streak: 12,
      activePersonalMasechet: 'Berakhot',
      pinnedPersonalMasechtot: ['Berakhot'],
    });
  });

  it('reloads factory settings and rebuilds study reminders', async () => {
    await useAppStore.getState().resetAllState();

    expect(mockResetDB).toHaveBeenCalledTimes(1);
    const state = useAppStore.getState();
    expect(state.settings?.theme_mode).toBe('system');
    expect(state.settings?.notification_hour).toBe(7);
    expect(state.settings?.notification_minute).toBe(30);
    expect(state.settings?.daf_day_start_mode).toBe('midnight');
    expect(state.settings?.auto_backup_enabled).toBe(0);
    expect(state.history).toEqual([]);
    expect(state.personalTrackRecords).toEqual([]);
    expect(state.streak).toBe(0);
    expect(state.activePersonalMasechet).toBeNull();
    expect(state.pinnedPersonalMasechtot).toEqual([]);
    expect(mockScheduleNotifications).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotifications).toHaveBeenCalledWith(
      7,
      30,
      'daily',
      expect.any(Array),
      true,
      { sound: true },
    );
  });

  it('keeps the data reset if reminder scheduling fails', async () => {
    mockScheduleNotifications.mockRejectedValueOnce(new Error('notifications unavailable'));

    await useAppStore.getState().resetAllState();

    const state = useAppStore.getState();
    expect(state.settings?.theme_mode).toBe('system');
    expect(state.history).toEqual([]);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });
});
