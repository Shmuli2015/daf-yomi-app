import { isAutoBackupDue, normalizeAutoBackupInterval } from '../autoBackupInterval';

const NOW = new Date('2026-10-15T12:00:00.000Z');

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
}

describe('autoBackupInterval', () => {
  it('normalizes unknown intervals to weekly', () => {
    expect(normalizeAutoBackupInterval('daily')).toBe('daily');
    expect(normalizeAutoBackupInterval('monthly')).toBe('monthly');
    expect(normalizeAutoBackupInterval('yearly')).toBe('weekly');
    expect(normalizeAutoBackupInterval(null)).toBe('weekly');
  });

  it('treats a missing or invalid timestamp as due', () => {
    expect(isAutoBackupDue(null, 'weekly', NOW)).toBe(true);
    expect(isAutoBackupDue('not-a-date', 'daily', NOW)).toBe(true);
  });

  it('waits for the selected interval', () => {
    expect(isAutoBackupDue(hoursAgo(23), 'daily', NOW)).toBe(false);
    expect(isAutoBackupDue(hoursAgo(24), 'daily', NOW)).toBe(true);
    expect(isAutoBackupDue(hoursAgo(24 * 6), 'weekly', NOW)).toBe(false);
    expect(isAutoBackupDue(hoursAgo(24 * 7), 'weekly', NOW)).toBe(true);
    expect(isAutoBackupDue(hoursAgo(24 * 29), 'monthly', NOW)).toBe(false);
    expect(isAutoBackupDue(hoursAgo(24 * 30), 'monthly', NOW)).toBe(true);
  });
});
