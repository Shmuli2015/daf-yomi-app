const mockGetAllScheduled = jest.fn();
const mockCancelScheduled = jest.fn(async () => undefined);
const mockScheduleNotificationAsync = jest.fn(async () => 'id');
const mockGetSettings = jest.fn();

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: mockGetAllScheduled,
  cancelScheduledNotificationAsync: mockCancelScheduled,
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('../../db/database', () => ({ getSettings: mockGetSettings }));
jest.mock('../dafDayBoundary', () => ({
  getDafDayDate: (d: Date) => d,
}));
jest.mock('../notificationCopy', () => ({
  getStudyReminderCopy: () => ({ title: 'title', body: 'body' }),
}));
jest.mock('../studyReminderTarget', () => ({
  buildStudyReminderTarget: () => ({ dateStr: '2026-10-15' }),
}));

import { extendStudyReminders } from '../extendStudyReminders';
import { REMINDER_WINDOW_DAYS } from '../reminderSchedule';

const DAY_MS = 24 * 60 * 60 * 1000;

function reminderAt(time: number, identifier = `r-${time}`) {
  return { identifier, content: { data: { scheduledFor: time } } };
}

function scheduledForFromCall(call: unknown): number {
  const payload = (call as [{ content: { data: { scheduledFor: number } } }])[0];
  return payload.content.data.scheduledFor;
}

describe('extendStudyReminders', () => {
  const now = new Date(2026, 9, 15, 6, 0, 0, 0);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({
      notifications_enabled: 1,
      notif_mode: 'daily',
      notification_hour: 7,
      notification_minute: 30,
      day_schedules: null,
      notification_sound_enabled: 1,
    });
  });

  it('adds only the days missing beyond the last scheduled reminder', async () => {
    const times: number[] = [];
    for (let offset = 0; offset < 29; offset += 1) {
      times.push(new Date(2026, 9, 15 + offset, 7, 30, 0, 0).getTime());
    }
    mockGetAllScheduled.mockResolvedValue(times.map(time => reminderAt(time)));

    const added = await extendStudyReminders(now);

    expect(added).toBe(1);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(scheduledForFromCall(mockScheduleNotificationAsync.mock.calls[0])).toBe(
      new Date(2026, 10, 13, 7, 30, 0, 0).getTime(),
    );
  });

  it('does not add anything when the window is full', async () => {
    const times: number[] = [];
    for (let offset = 0; offset < 31; offset += 1) {
      times.push(new Date(2026, 9, 15 + offset, 7, 30, 0, 0).getTime());
    }
    mockGetAllScheduled.mockResolvedValue(times.map(time => reminderAt(time)));

    expect(await extendStudyReminders(now)).toBe(0);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('rebuilds the daily window when only a snooze reminder is scheduled', async () => {
    mockGetAllScheduled.mockResolvedValue([
      reminderAt(now.getTime() + DAY_MS, 'later-reminder-1'),
    ]);

    const added = await extendStudyReminders(now);

    expect(added).toBe(REMINDER_WINDOW_DAYS);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(REMINDER_WINDOW_DAYS);
    expect(mockCancelScheduled).not.toHaveBeenCalled();
  });

  it('does not schedule when notifications are disabled', async () => {
    mockGetAllScheduled.mockResolvedValue([
      reminderAt(now.getTime() + DAY_MS),
      reminderAt(now.getTime() + 2 * DAY_MS, 'later-reminder-1'),
    ]);
    mockGetSettings.mockReturnValue({ notifications_enabled: 0 });

    expect(await extendStudyReminders(now)).toBe(0);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
