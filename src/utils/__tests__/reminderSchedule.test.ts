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
  resolveReminderTime,
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

describe('resolveReminderTime', () => {
  const distinctWeek: DaySchedule[] = [
    { enabled: true, hour: 6, minute: 10 },
    { enabled: true, hour: 7, minute: 20 },
    { enabled: true, hour: 8, minute: 30 },
    { enabled: true, hour: 9, minute: 40 },
    { enabled: true, hour: 10, minute: 50 },
    { enabled: true, hour: 11, minute: 55 },
    { enabled: false, hour: 12, minute: 0 },
  ];

  it('resolves daily mode using common hour and minute', () => {
    const sunday = new Date(2026, 10, 1, 0, 0, 0, 0);
    const result = resolveReminderTime(sunday, {
      mode: 'daily',
      hour: 7,
      minute: 30,
      schedules: distinctWeek,
    });
    expect(result).toEqual(new Date(2026, 10, 1, 7, 30, 0, 0));
  });

  it('maps each day of the week to its schedule index', () => {
    const sunday = new Date(2026, 10, 1, 0, 0, 0, 0);
    expect(sunday.getDay()).toBe(0);
    const sundayResult = resolveReminderTime(sunday, {
      mode: 'custom',
      hour: 7,
      minute: 30,
      schedules: distinctWeek,
    });
    expect(sundayResult).toEqual(new Date(2026, 10, 1, 6, 10, 0, 0));

    const monday = new Date(2026, 10, 2, 0, 0, 0, 0);
    expect(monday.getDay()).toBe(1);
    const mondayResult = resolveReminderTime(monday, {
      mode: 'custom',
      hour: 7,
      minute: 30,
      schedules: distinctWeek,
    });
    expect(mondayResult).toEqual(new Date(2026, 10, 2, 7, 20, 0, 0));

    const friday = new Date(2026, 10, 6, 0, 0, 0, 0);
    expect(friday.getDay()).toBe(5);
    const fridayResult = resolveReminderTime(friday, {
      mode: 'custom',
      hour: 7,
      minute: 30,
      schedules: distinctWeek,
    });
    expect(fridayResult).toEqual(new Date(2026, 10, 6, 11, 55, 0, 0));

    const saturday = new Date(2026, 10, 7, 0, 0, 0, 0);
    expect(saturday.getDay()).toBe(6);
    const saturdayResult = resolveReminderTime(saturday, {
      mode: 'custom',
      hour: 7,
      minute: 30,
      schedules: distinctWeek,
    });
    expect(saturdayResult).toBeNull();
  });
});
