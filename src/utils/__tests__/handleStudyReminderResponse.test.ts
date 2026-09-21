jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
}));

const mockDismissReminderFromTray = jest.fn(async () => undefined);
const mockScheduleSnoozeReminder = jest.fn(async () => undefined);
const mockRequestHomeTabFocus = jest.fn();
const mockGetSettings = jest.fn(() => ({ notification_sound_enabled: 1 }));
const mockLoadInitialData = jest.fn();
const mockMarkTodayAsLearned = jest.fn();

jest.mock('../dismissReminderFromTray', () => ({
  dismissReminderFromTray: mockDismissReminderFromTray,
}));
jest.mock('../scheduleSnoozeReminder', () => ({
  scheduleSnoozeReminder: mockScheduleSnoozeReminder,
}));
jest.mock('../homeTabFocus', () => ({
  requestHomeTabFocus: mockRequestHomeTabFocus,
}));
jest.mock('../../db/database', () => ({
  getSettings: mockGetSettings,
}));
jest.mock('../../store/useAppStore', () => ({
  useAppStore: {
    getState: () => ({
      loadInitialData: mockLoadInitialData,
      markTodayAsLearned: mockMarkTodayAsLearned,
    }),
  },
}));

import { handleStudyReminderResponse } from '../handleStudyReminderResponse';

describe('handleStudyReminderResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dismisses and marks today learned for finish-daf', async () => {
    await handleStudyReminderResponse({
      actionIdentifier: 'finish-daf',
      notificationId: 'notif-1',
    });

    expect(mockDismissReminderFromTray).toHaveBeenCalledWith('notif-1');
    expect(mockLoadInitialData).toHaveBeenCalled();
    expect(mockMarkTodayAsLearned).toHaveBeenCalled();
    expect(mockScheduleSnoozeReminder).not.toHaveBeenCalled();
  });

  it('dismisses and schedules snooze for later', async () => {
    await handleStudyReminderResponse({
      actionIdentifier: 'later',
      notificationId: 'notif-2',
    });

    expect(mockDismissReminderFromTray).toHaveBeenCalledWith('notif-2');
    expect(mockScheduleSnoozeReminder).toHaveBeenCalledWith(true);
    expect(mockMarkTodayAsLearned).not.toHaveBeenCalled();
  });

  it('focuses home for default body tap', async () => {
    await handleStudyReminderResponse({
      actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
      notificationId: 'notif-3',
    });

    expect(mockLoadInitialData).toHaveBeenCalled();
    expect(mockRequestHomeTabFocus).toHaveBeenCalled();
    expect(mockDismissReminderFromTray).not.toHaveBeenCalled();
  });
});
