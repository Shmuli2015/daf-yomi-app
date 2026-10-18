import {
  autoBackupIssueMessage,
  isAutoBackupFileMissing,
  normalizeAutoBackupIssue,
} from '../autoBackupIssue';

describe('autoBackupIssue', () => {
  it('normalizes stored issue values', () => {
    expect(normalizeAutoBackupIssue('missing')).toBe('missing');
    expect(normalizeAutoBackupIssue('missing_previous')).toBe('missing_previous');
    expect(normalizeAutoBackupIssue('restored')).toBe('restored');
    expect(normalizeAutoBackupIssue('failed')).toBe('failed');
    expect(normalizeAutoBackupIssue('other')).toBeNull();
    expect(normalizeAutoBackupIssue(null)).toBeNull();
  });

  it('describes a missing file separately from a write failure', () => {
    expect(isAutoBackupFileMissing('missing')).toBe(true);
    expect(isAutoBackupFileMissing('missing_previous')).toBe(true);
    expect(isAutoBackupFileMissing('failed')).toBe(false);
    expect(autoBackupIssueMessage('missing')).toContain('קובץ הגיבוי לא נמצא');
    expect(autoBackupIssueMessage('missing')).toContain('הנתונים במכשיר שמורים');
    expect(autoBackupIssueMessage('missing_previous')).toContain('עותק קודם');
    expect(autoBackupIssueMessage('restored')).toContain('שמרנו אותו מחדש');
    expect(autoBackupIssueMessage('failed')).toContain('לא הצלחנו לעדכן');
    expect(autoBackupIssueMessage(null)).toBeNull();
  });
});
