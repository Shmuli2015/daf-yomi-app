jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import {
  DEFAULT_SCHEDULES,
  parseDaySchedulesJson,
  reminderModeFromSettings,
  resolveSchedulesForReminderMode,
  type DaySchedule,
} from '../reminderSchedule';

const customWeek: DaySchedule[] = [
  { enabled: true, hour: 8, minute: 0 },
  { enabled: true, hour: 8, minute: 0 },
  { enabled: true, hour: 8, minute: 0 },
  { enabled: true, hour: 8, minute: 0 },
  { enabled: true, hour: 8, minute: 0 },
  { enabled: false, hour: 8, minute: 0 },
  { enabled: false, hour: 8, minute: 0 },
];

const disabledWeek: DaySchedule[] = Array.from({ length: 7 }, () => ({
  enabled: false,
  hour: 9,
  minute: 0,
}));

describe('parseDaySchedulesJson', () => {
  it('falls back to default schedules for missing or invalid json', () => {
    expect(parseDaySchedulesJson(null)).toEqual(DEFAULT_SCHEDULES);
    expect(parseDaySchedulesJson(undefined)).toEqual(DEFAULT_SCHEDULES);
    expect(parseDaySchedulesJson('')).toEqual(DEFAULT_SCHEDULES);
    expect(parseDaySchedulesJson('not-json')).toEqual(DEFAULT_SCHEDULES);
    expect(parseDaySchedulesJson('[]')).toEqual(DEFAULT_SCHEDULES);
    expect(parseDaySchedulesJson('{}')).toEqual(DEFAULT_SCHEDULES);
    expect(parseDaySchedulesJson('[{"enabled":true,"hour":8,"minute":0}]')).toEqual(
      DEFAULT_SCHEDULES,
    );
  });

  it('keeps a valid 7-day custom week', () => {
    expect(parseDaySchedulesJson(JSON.stringify(customWeek))).toEqual(customWeek);
  });
});

describe('resolveSchedulesForReminderMode', () => {
  it('falls back to defaults when custom mode has no enabled days', () => {
    expect(resolveSchedulesForReminderMode('custom', [])).toEqual(DEFAULT_SCHEDULES);
    expect(resolveSchedulesForReminderMode('custom', disabledWeek)).toEqual(DEFAULT_SCHEDULES);
  });

  it('keeps a custom week that has at least one enabled day', () => {
    expect(resolveSchedulesForReminderMode('custom', customWeek)).toEqual(customWeek);
  });

  it('does not force enabled days in daily mode', () => {
    expect(resolveSchedulesForReminderMode('daily', disabledWeek)).toEqual(disabledWeek);
    expect(resolveSchedulesForReminderMode('daily', DEFAULT_SCHEDULES)).toEqual(DEFAULT_SCHEDULES);
  });
});

describe('reminderModeFromSettings', () => {
  it('treats unknown values as daily', () => {
    expect(reminderModeFromSettings('custom')).toBe('custom');
    expect(reminderModeFromSettings('daily')).toBe('daily');
    expect(reminderModeFromSettings(null)).toBe('daily');
    expect(reminderModeFromSettings('weekly')).toBe('daily');
  });
});
