const mockGetAllScheduled = jest.fn();
const mockScheduleAt = jest.fn(async () => 'id');
const mockGetSettings = jest.fn();

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: mockGetAllScheduled,
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('../../db/database', () => ({ getSettings: mockGetSettings }));
jest.mock('../reminderSchedule', () => {
  const actual = jest.requireActual('../reminderSchedule');
  return { ...actual, scheduleStudyReminderAt: mockScheduleAt };
});

import { extendStudyReminders } from '../extendStudyReminders';

const DAY_MS = 24 * 60 * 60 * 1000;

function reminderAt(time: number, identifier = `r-${time}`) {
  return { identifier, content: { data: { scheduledFor: time } } };
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
    expect(mockScheduleAt).toHaveBeenCalledTimes(1);
    const scheduledDate = (mockScheduleAt.mock.calls[0] as unknown as [Date])[0];
    expect(scheduledDate.getTime()).toBe(new Date(2026, 10, 13, 7, 30, 0, 0).getTime());
  });

  it('does not add anything when the window is full', async () => {
    const times: number[] = [];
    for (let offset = 0; offset < 31; offset += 1) {
      times.push(new Date(2026, 9, 15 + offset, 7, 30, 0, 0).getTime());
    }
    mockGetAllScheduled.mockResolvedValue(times.map(time => reminderAt(time)));

    expect(await extendStudyReminders(now)).toBe(0);
    expect(mockScheduleAt).not.toHaveBeenCalled();
  });

  it('ignores snooze reminders and does nothing when disabled', async () => {
    mockGetAllScheduled.mockResolvedValue([
      reminderAt(now.getTime() + DAY_MS, 'later-reminder-1'),
    ]);
    expect(await extendStudyReminders(now)).toBe(0);

    mockGetSettings.mockReturnValue({ notifications_enabled: 0 });
    expect(await extendStudyReminders(now)).toBe(0);
    expect(mockScheduleAt).not.toHaveBeenCalled();
  });
});
