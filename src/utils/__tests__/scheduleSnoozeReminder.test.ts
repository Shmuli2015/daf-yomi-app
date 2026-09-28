const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('scheduled-id');
const mockGetAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([]);
const mockCancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) => mockGetAllScheduledNotificationsAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancelScheduledNotificationAsync(...args),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
  },
  AndroidNotificationPriority: {
    MAX: 'max',
  },
}));

jest.mock('../../db/database', () => ({
  getSettings: () => ({ daf_day_start_mode: 'midnight' }),
}));

jest.mock('../dafDayBoundary', () => ({
  getDafDayDate: (d: Date) => d,
}));

jest.mock('../notificationCopy', () => ({
  getSnoozeReminderCopy: () => ({
    title: '⏰ תזכורת נודניק',
    body: 'גוף ההתראה',
  }),
}));

import {
  cancelExistingSnoozeReminders,
  isSnoozeReminderId,
  scheduleSnoozeReminder,
  SNOOZE_REMINDER_PREFIX,
} from '../scheduleSnoozeReminder';

describe('scheduleSnoozeReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('correctly detects snooze reminder IDs', () => {
    expect(isSnoozeReminderId('later-reminder')).toBe(true);
    expect(isSnoozeReminderId('later-reminder-123456789')).toBe(true);
    expect(isSnoozeReminderId('daily-reminder-1')).toBe(false);
    expect(isSnoozeReminderId(null)).toBe(false);
    expect(isSnoozeReminderId(undefined)).toBe(false);
  });

  it('cancels existing snooze reminders prior to scheduling', async () => {
    mockGetAllScheduledNotificationsAsync.mockResolvedValueOnce([
      { identifier: 'later-reminder-old-1' },
      { identifier: 'other-notif' },
      { identifier: 'later-reminder-old-2' },
    ]);

    await cancelExistingSnoozeReminders();

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('later-reminder-old-1');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('later-reminder-old-2');
    expect(mockCancelScheduledNotificationAsync).not.toHaveBeenCalledWith('other-notif');
  });

  it('schedules a new snooze notification with a unique prefixed identifier', async () => {
    mockGetAllScheduledNotificationsAsync.mockResolvedValueOnce([]);

    await scheduleSnoozeReminder(true);

    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const callArgs = mockScheduleNotificationAsync.mock.calls[0][0];
    expect(callArgs.identifier).toMatch(new RegExp(`^${SNOOZE_REMINDER_PREFIX}-\\d+$`));
    expect(callArgs.content.categoryIdentifier).toBe('study-reminder');
    expect(callArgs.content.sound).toBe(true);
    expect(callArgs.trigger.seconds).toBe(3600);
  });
});
