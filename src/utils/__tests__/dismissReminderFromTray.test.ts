jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-notifications', () => ({}));

import { getNotificationIdFromActionData } from '../dismissReminderFromTray';

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
    expect(getNotificationIdFromActionData({ identifier: 'from-root' })).toBe('from-root');
  });

  it('returns undefined when no identifier exists', () => {
    expect(getNotificationIdFromActionData(undefined)).toBeUndefined();
    expect(getNotificationIdFromActionData({})).toBeUndefined();
    expect(getNotificationIdFromActionData({ notification: { request: { identifier: '' } } })).toBeUndefined();
  });
});
