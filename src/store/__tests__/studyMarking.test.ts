const mockGetSettings = jest.fn();
const mockUpdateDailyRecord = jest.fn();
const mockGetDailyRecord = jest.fn();
const mockGetAllRecords = jest.fn();
const mockBatchUpdateDailyRecords = jest.fn();
const mockUpdatePersonalTrackRecord = jest.fn();
const mockGetPersonalTrackRecords = jest.fn();

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('../../db/database', () => {
  const mocks: Record<string, unknown> = {
    __esModule: true,
    getSettings: mockGetSettings,
    updateDailyRecord: mockUpdateDailyRecord,
    getDailyRecord: mockGetDailyRecord,
    getAllRecords: mockGetAllRecords,
    batchUpdateDailyRecords: mockBatchUpdateDailyRecords,
    updatePersonalTrackRecord: mockUpdatePersonalTrackRecord,
    getPersonalTrackRecords: mockGetPersonalTrackRecords,
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
  scheduleNotifications: jest.fn(async () => undefined),
  DEFAULT_SCHEDULES: Array.from({ length: 7 }, (_, i) => ({
    enabled: i < 6,
    hour: 7,
    minute: 30,
  })),
}));

jest.mock('../../services/sentry', () => ({
  captureException: jest.fn(),
}));

import type { DailyRecord } from '../../db/database';
import type { ProgressCache } from '../../utils/progressCache';
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

const currentDate = new Date(2026, 0, 15);
const todayDateStr = '2026-01-15';

const seedHistory: DailyRecord[] = [
  {
    id: 1,
    date: '2026-01-14',
    masechet: 'ברכות',
    daf: "דף ב'",
    status: 'learned',
    percentage: 100,
    amud: null,
    learnedAt: '2026-01-14T10:00:00.000Z',
  },
];

const emptyProgressCache: ProgressCache = {
  historyHash: 'seed',
  masechetProgress: new Map(),
  sederProgress: new Map(),
  totalShasProgress: {
    learnedCount: 0,
    totalPages: 2711,
    percentage: 0,
    dafYomiCount: 0,
    personalCount: 0,
  },
  streak: 0,
};

function seedStore(overrides: Record<string, unknown> = {}) {
  useAppStore.setState({
    currentDate,
    todayMasechet: 'ברכות',
    todayDafNum: "דף ב'",
    history: seedHistory,
    progressCache: emptyProgressCache,
    settings: { ...defaultSettings },
    personalTrackRecords: [],
    ...overrides,
  });
}

describe('study marking store actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({ ...defaultSettings });
    mockGetAllRecords.mockReturnValue([]);
    mockGetDailyRecord.mockReturnValue(null);
    mockGetPersonalTrackRecords.mockReturnValue([]);
    seedStore();
  });

  it('markTodayAsLearned writes learned at 100 percent', () => {
    useAppStore.getState().markTodayAsLearned();

    expect(mockUpdateDailyRecord).toHaveBeenCalledWith(
      todayDateStr,
      'ברכות',
      "דף ב'",
      'learned',
      100,
      null,
    );
  });

  it('toggleAnyDafLearned marks an empty or missed daf as learned', () => {
    useAppStore.getState().toggleAnyDafLearned(todayDateStr, 'ברכות', "דף ב'");
    expect(mockUpdateDailyRecord).toHaveBeenCalledWith(
      todayDateStr,
      'ברכות',
      "דף ב'",
      'learned',
      undefined,
      null,
    );

    mockUpdateDailyRecord.mockClear();
    seedStore({
      history: [
        {
          ...seedHistory[0],
          date: todayDateStr,
          status: 'missed',
          percentage: 0,
        },
      ],
    });

    useAppStore.getState().toggleAnyDafLearned(todayDateStr, 'ברכות', "דף ב'");
    expect(mockUpdateDailyRecord).toHaveBeenCalledWith(
      todayDateStr,
      'ברכות',
      "דף ב'",
      'learned',
      undefined,
      null,
    );
  });

  it('toggleAnyDafLearned marks learned or partial as missed', () => {
    seedStore({
      history: [{ ...seedHistory[0], date: todayDateStr, status: 'learned' }],
    });
    useAppStore.getState().toggleAnyDafLearned(todayDateStr, 'ברכות', "דף ב'");
    expect(mockUpdateDailyRecord).toHaveBeenCalledWith(
      todayDateStr,
      'ברכות',
      "דף ב'",
      'missed',
      undefined,
      null,
    );

    mockUpdateDailyRecord.mockClear();
    seedStore({
      history: [
        {
          ...seedHistory[0],
          date: todayDateStr,
          status: 'partial',
          percentage: 50,
          amud: 'a',
        },
      ],
    });
    useAppStore.getState().toggleAnyDafLearned(todayDateStr, 'ברכות', "דף ב'");
    expect(mockUpdateDailyRecord).toHaveBeenCalledWith(
      todayDateStr,
      'ברכות',
      "דף ב'",
      'missed',
      undefined,
      null,
    );
  });

  it('markPartialAmud stores partial at 50 percent for the chosen amud', () => {
    useAppStore.getState().markPartialAmud(todayDateStr, 'ברכות', "דף ב'", 'a');
    expect(mockUpdateDailyRecord).toHaveBeenCalledWith(
      todayDateStr,
      'ברכות',
      "דף ב'",
      'partial',
      50,
      'a',
    );
  });

  it('batchMarkDafim and batchUnmarkDafim pass learned or missed with no amud', () => {
    const updates = [
      { dateStr: '2026-01-10', masechet: 'ברכות', daf: "דף ב'" },
      { dateStr: '2026-01-11', masechet: 'ברכות', daf: "דף ג'" },
    ];

    useAppStore.getState().batchMarkDafim(updates);
    expect(mockBatchUpdateDailyRecords).toHaveBeenCalledWith([
      { dateStr: '2026-01-10', masechet: 'ברכות', daf: "דף ב'", status: 'learned', amud: null },
      { dateStr: '2026-01-11', masechet: 'ברכות', daf: "דף ג'", status: 'learned', amud: null },
    ]);

    mockBatchUpdateDailyRecords.mockClear();
    useAppStore.getState().batchUnmarkDafim(updates);
    expect(mockBatchUpdateDailyRecords).toHaveBeenCalledWith([
      { dateStr: '2026-01-10', masechet: 'ברכות', daf: "דף ב'", status: 'missed', amud: null },
      { dateStr: '2026-01-11', masechet: 'ברכות', daf: "דף ג'", status: 'missed', amud: null },
    ]);
  });

  it('refreshHistory patches up to 40 dates when a cache exists', () => {
    const patched = seedHistory[0];
    mockGetDailyRecord.mockReturnValue(patched);

    useAppStore.getState().refreshHistory('ברכות', ['2026-01-14']);

    expect(mockGetDailyRecord).toHaveBeenCalledWith('2026-01-14');
    expect(mockGetAllRecords).not.toHaveBeenCalled();
  });

  it('refreshHistory reloads all records when the patch list is over 40 or cache is missing', () => {
    const dates = Array.from({ length: 41 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`);
    useAppStore.getState().refreshHistory(undefined, dates);
    expect(mockGetAllRecords).toHaveBeenCalledTimes(1);

    mockGetAllRecords.mockClear();
    seedStore({ progressCache: null });
    useAppStore.getState().refreshHistory('ברכות', ['2026-01-14']);
    expect(mockGetAllRecords).toHaveBeenCalledTimes(1);
  });

  it('does not write personal-track marks when the banner is disabled', () => {
    seedStore({
      settings: { ...defaultSettings, show_personal_track_banner: 0 },
    });

    useAppStore.getState().togglePersonalDafLearned('Berakhot', 2);
    useAppStore.getState().setPersonalDafStudyStatus('Berakhot', 2, 'none');

    expect(mockUpdatePersonalTrackRecord).not.toHaveBeenCalled();
  });

  it('togglePersonalDafLearned writes learned when empty and none when already learned', () => {
    useAppStore.getState().togglePersonalDafLearned('Berakhot', 2);
    expect(mockUpdatePersonalTrackRecord).toHaveBeenCalledWith('Berakhot', 2, 'learned', null);

    mockUpdatePersonalTrackRecord.mockClear();
    seedStore({
      personalTrackRecords: [
        { masechet: 'Berakhot', daf_num: 2, status: 'learned', learnedAt: '2026-01-01' },
      ],
    });
    useAppStore.getState().togglePersonalDafLearned('Berakhot', 2);
    expect(mockUpdatePersonalTrackRecord).toHaveBeenCalledWith('Berakhot', 2, 'none', null);
  });

  it('setPersonalDafStudyStatus passes none through to the database', () => {
    useAppStore.getState().setPersonalDafStudyStatus('Berakhot', 2, 'none');
    expect(mockUpdatePersonalTrackRecord).toHaveBeenCalledWith('Berakhot', 2, 'none', null);
  });
});
