import { isBackupStale, getBackupReminderText } from '../backupReminder';

describe('backupReminder', () => {
  const now = new Date('2026-09-16T12:00:00.000Z');

  it('treats missing backup as stale', () => {
    expect(isBackupStale(null, now)).toBe(true);
    expect(getBackupReminderText(null, now)).toContain('מומלץ לגבות');
  });

  it('is stale after 30 days', () => {
    expect(isBackupStale('2026-08-01T12:00:00.000Z', now)).toBe(true);
    expect(isBackupStale('2026-09-10T12:00:00.000Z', now)).toBe(false);
    expect(getBackupReminderText('2026-09-10T12:00:00.000Z', now)).toBeNull();
  });
});
