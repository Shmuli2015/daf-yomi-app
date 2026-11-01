const mockGetAllScheduled = jest.fn();
const mockCancelAllScheduled = jest.fn(async () => undefined);
const mockCancelScheduled = jest.fn(async () => undefined);
const mockScheduleNotificationAsync = jest.fn(async () => 'id');
const mockGetSettings = jest.fn();
const mockHasExactAlarm = jest.fn(async () => true);
const mockPromptExactAlarm = jest.fn(async () => false);

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: mockGetAllScheduled,
  cancelAllScheduledNotificationsAsync: mockCancelAllScheduled,
  cancelScheduledNotificationAsync: mockCancelScheduled,
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('../../db/database', () => ({ getSettings: mockGetSettings }));
jest.mock('../exactAlarm', () => ({
  hasExactAlarmPermission: mockHasExactAlarm,
  promptForExactAlarmPermission: mockPromptExactAlarm,
}));
jest.mock('../../services/sentry', () => ({
  captureException: jest.fn(),
}));
jest.mock('../dafDayBoundary', () => ({
  getDafDayDate: (d: Date) => d,
}));
jest.mock('../notificationCopy', () => ({
  getStudyReminderCopy: () => ({ title: 'title', body: 'body' }),
}));
jest.mock('../studyReminderTarget', () => ({
  buildStudyReminderTarget: () => ({ dateStr: '2026-10-15' }),
}));

import { scheduleNotifications } from '../notifications';
import { DEFAULT_SCHEDULES, REMINDER_WINDOW_DAYS } from '../reminderSchedule';

describe('scheduleNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({
      notifications_enabled: 1,
      notif_mode: 'daily',
      notification_hour: 7,
      notification_minute: 30,
      notification_sound_enabled: 1,
    });
    mockGetAllScheduled.mockResolvedValue([]);
    mockHasExactAlarm.mockResolvedValue(true);
  });

  it('cancels only daily reminders when enabled and keeps snooze', async () => {
    mockGetAllScheduled.mockResolvedValue([
      { identifier: 'later-reminder-123' },
      { identifier: 'daily-1' },
      { identifier: 'daily-2' },
    ]);

    await scheduleNotifications(7, 30, 'daily', DEFAULT_SCHEDULES, true, { sound: true });

    expect(mockCancelAllScheduled).not.toHaveBeenCalled();
    expect(mockCancelScheduled).toHaveBeenCalledWith('daily-1');
    expect(mockCancelScheduled).toHaveBeenCalledWith('daily-2');
    expect(mockCancelScheduled).not.toHaveBeenCalledWith('later-reminder-123');
    expect(mockScheduleNotificationAsync.mock.calls.length).toBeGreaterThan(0);
    expect(mockScheduleNotificationAsync.mock.calls.length).toBeLessThanOrEqual(REMINDER_WINDOW_DAYS);
  });

  it('cancels snooze as well when disabled and does not reschedule', async () => {
    mockGetAllScheduled.mockResolvedValue([
      { identifier: 'later-reminder-123' },
      { identifier: 'daily-1' },
    ]);

    const scheduled = await scheduleNotifications(
      7,
      30,
      'daily',
      DEFAULT_SCHEDULES,
      false,
      { sound: true },
    );

    expect(scheduled).toBe(0);
    expect(mockCancelAllScheduled).not.toHaveBeenCalled();
    expect(mockCancelScheduled).toHaveBeenCalledWith('later-reminder-123');
    expect(mockCancelScheduled).toHaveBeenCalledWith('daily-1');
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
