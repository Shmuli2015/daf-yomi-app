const mockDismissReminderFromTray = jest.fn(async () => undefined);
const mockGetDailyRecord = jest.fn();
const mockGetAllScheduledNotificationsAsync = jest.fn(async (): Promise<{ identifier: string }[]> => []);

jest.mock('../dismissReminderFromTray', () => ({
  dismissReminderFromTray: mockDismissReminderFromTray,
}));
jest.mock('../../db/database', () => ({
  getDailyRecord: mockGetDailyRecord,
}));
jest.mock('../dafYomi', () => ({
  getDateStr: () => '2026-09-22',
}));
jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: mockGetAllScheduledNotificationsAsync,
}));

import { dismissStuckStudyReminders } from '../dismissStuckStudyReminders';

describe('dismissStuckStudyReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dismisses when today is learned', async () => {
    mockGetDailyRecord.mockReturnValue({ status: 'learned' });

    await dismissStuckStudyReminders();

    expect(mockDismissReminderFromTray).toHaveBeenCalled();
    expect(mockGetAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('dismisses when a snooze reminder is pending', async () => {
    mockGetDailyRecord.mockReturnValue({ status: null });
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([{ identifier: 'later-reminder' }]);

    await dismissStuckStudyReminders();

    expect(mockDismissReminderFromTray).toHaveBeenCalled();
  });

  it('does nothing when not learned and no snooze pending', async () => {
    mockGetDailyRecord.mockReturnValue({ status: null });
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([]);

    await dismissStuckStudyReminders();

    expect(mockDismissReminderFromTray).not.toHaveBeenCalled();
  });
});
