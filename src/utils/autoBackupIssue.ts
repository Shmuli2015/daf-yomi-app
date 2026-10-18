export const AUTO_BACKUP_ISSUES = ['failed', 'missing', 'missing_previous', 'restored'] as const;

export type AutoBackupIssue = (typeof AUTO_BACKUP_ISSUES)[number];

const FAILED_MESSAGE =
  'לא הצלחנו לעדכן את קובץ הגיבוי. בחר תיקייה מחדש או בדוק שההרשאה לתיקייה עדיין פעילה.';

const MISSING_MESSAGE =
  'קובץ הגיבוי לא נמצא בתיקייה. הנתונים במכשיר שמורים. בחרו שוב תיקייה דרך החלפת תיקיית גיבוי כדי לשמור קובץ חדש.';

const MISSING_WITH_PREVIOUS_MESSAGE =
  'קובץ הגיבוי לא נמצא בתיקייה. הנתונים במכשיר שמורים, ונשאר עותק קודם באותה תיקייה. בחרו שוב תיקייה דרך החלפת תיקיית גיבוי כדי לשמור קובץ חדש.';

const RESTORED_MESSAGE =
  'קובץ הגיבוי לא נמצא בתיקייה, ושמרנו אותו מחדש מהנתונים שבמכשיר.';

export function normalizeAutoBackupIssue(value: unknown): AutoBackupIssue | null {
  if (
    value === 'failed' ||
    value === 'missing' ||
    value === 'missing_previous' ||
    value === 'restored'
  ) {
    return value;
  }
  return null;
}

export function isAutoBackupFileMissing(issue: AutoBackupIssue | null): boolean {
  return issue === 'missing' || issue === 'missing_previous';
}

export function autoBackupIssueMessage(issue: AutoBackupIssue | null): string | null {
  if (issue === 'missing') return MISSING_MESSAGE;
  if (issue === 'missing_previous') return MISSING_WITH_PREVIOUS_MESSAGE;
  if (issue === 'restored') return RESTORED_MESSAGE;
  if (issue === 'failed') return FAILED_MESSAGE;
  return null;
}

export function autoBackupFailureMessage(): string {
  return FAILED_MESSAGE;
}
