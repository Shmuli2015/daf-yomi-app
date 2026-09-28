const mockDismissNotificationAsync = jest.fn().mockResolvedValue(undefined);
const mockDismissAllNotificationsAsync = jest.fn().mockResolvedValue(undefined);
const mockGetPresentedNotificationsAsync = jest.fn().mockResolvedValue([]);

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-notifications', () => ({
  dismissNotificationAsync: (...args: unknown[]) => mockDismissNotificationAsync(...args),
  dismissAllNotificationsAsync: (...args: unknown[]) => mockDismissAllNotificationsAsync(...args),
  getPresentedNotificationsAsync: (...args: unknown[]) => mockGetPresentedNotificationsAsync(...args),
}));

import { dismissReminderFromTray, getNotificationIdFromActionData } from '../dismissReminderFromTray';

describe('getNotificationIdFromActionData', () => {
  it('reads the identifier from a notification response payload', () => {
    expect(
      getNotificationIdFromActionData({
        actionIdentifier: 'finish-daf',
        notification: { request: { identifier: 'abc-123' } },
      }),
    ).toBe('abc-123');
  });

  it('falls back to alternate payload shapes', () => {
    expect(getNotificationIdFromActionData({ notification: { identifier: 'from-notification' } })).toBe(
      'from-notification',
    );
    expect(getNotificationIdFromActionData({ request: { identifier: 'from-request' } })).toBe(
      'from-request',
    );
    expect(
      getNotificationIdFromActionData({
        notificationResponse: { notification: { request: { identifier: 'from-wrapped' } } },
      }),
    ).toBe('from-wrapped');
    expect(getNotificationIdFromActionData({ identifier: 'from-root' })).toBe('from-root');
  });

  it('returns undefined when no identifier exists', () => {
    expect(getNotificationIdFromActionData(undefined)).toBeUndefined();
    expect(getNotificationIdFromActionData({})).toBeUndefined();
    expect(getNotificationIdFromActionData({ notification: { request: { identifier: '' } } })).toBeUndefined();
  });
});

describe('dismissReminderFromTray', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dismisses specific notification and clears tray when notificationId is provided', async () => {
    mockGetPresentedNotificationsAsync.mockResolvedValueOnce([]);

    await dismissReminderFromTray('test-notif-id');

    expect(mockDismissNotificationAsync).toHaveBeenCalledWith('test-notif-id');
    expect(mockDismissAllNotificationsAsync).toHaveBeenCalled();
  });

  it('dismisses all presented notifications even if category identifier is missing', async () => {
    mockGetPresentedNotificationsAsync
      .mockResolvedValueOnce([
        { request: { identifier: 'active-1', content: {} } },
      ])
      .mockResolvedValueOnce([]);

    await dismissReminderFromTray();

    expect(mockDismissNotificationAsync).toHaveBeenCalledWith('active-1');
    expect(mockDismissAllNotificationsAsync).toHaveBeenCalled();
  });

  it('handles empty presented list and still invokes dismissAllNotificationsAsync', async () => {
    mockGetPresentedNotificationsAsync.mockResolvedValue([]);

    await dismissReminderFromTray();

    expect(mockDismissAllNotificationsAsync).toHaveBeenCalled();
  });

  it('catches notification dismissal errors gracefully without throwing', async () => {
    mockDismissNotificationAsync.mockRejectedValueOnce(new Error('Native error'));
    mockDismissAllNotificationsAsync.mockRejectedValueOnce(new Error('Native error'));

    await expect(dismissReminderFromTray('error-id')).resolves.not.toThrow();
  });
});
