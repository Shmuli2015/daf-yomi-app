import {
  buildBackupSummary,
  buildDisplaySummary,
  buildHelpSummary,
  buildNotificationsSummary,
} from '../settingsSummaries';

describe('settingsSummaries', () => {
  it('builds notification summaries', () => {
    expect(buildNotificationsSummary(false, 'daily', 7, 30)).toBe('כבוי');
    expect(buildNotificationsSummary(true, 'daily', 7, 5)).toBe('יומי בשעה 07:05');
    expect(buildNotificationsSummary(true, 'custom', 7, 30)).toBe('לפי ימי השבוע');
  });

  it('distinguishes daf day start modes in display summary', () => {
    expect(buildDisplaySummary('dark', 'midnight', 18, 0)).toBe('כהה, החלפה בחצות');
    expect(buildDisplaySummary('light', 'custom_hour', 18, 30)).toBe(
      'בהיר, החלפה שעה קבועה (18:30)',
    );
    expect(buildDisplaySummary('system', 'weekly', 18, 0)).toBe('מערכת, החלפה לפי ימים');
  });

  it('separates backup status from cache size', () => {
    expect(buildBackupSummary(null, '12 MB')).toBe('טרם גובה • מטמון 12 MB');
    expect(buildBackupSummary('2024-01-01T00:00:00.000Z', '3 MB')).toBe('מעודכן • מטמון 3 MB');
  });

  it('builds help summary with optional version', () => {
    expect(buildHelpSummary()).toBe('מדריך למשתמש ועזרה');
    expect(buildHelpSummary('1.2.3')).toBe('גרסה 1.2.3 • מדריך ועזרה');
  });
});
