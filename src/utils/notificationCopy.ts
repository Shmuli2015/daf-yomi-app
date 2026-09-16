import { getDafByDate } from './dafYomi';
import { dafYomiDisplayMasechetHe } from './mishnahOnlySefaria';

type ReminderCopy = { title: string; body: string };

export function getTodayDafLabel(date: Date = new Date()): string {
  const dafInfo = getDafByDate(date);
  return `${dafYomiDisplayMasechetHe(dafInfo.masechet, dafInfo.dafNum)} ${dafInfo.daf}`;
}

export function getStudyReminderCopy(date: Date = new Date()): ReminderCopy {
  const dafLabel = getTodayDafLabel(date);
  return {
    title: 'תזכורת ללימוד הדף היומי',
    body: `הגיע זמן הלימוד. הדף של היום: ${dafLabel}`,
  };
}

export function getSnoozeReminderCopy(date: Date = new Date()): ReminderCopy {
  const dafLabel = getTodayDafLabel(date);
  return {
    title: 'תזכורת נוספת ללימוד',
    body: `הגיע זמן הלימוד. הדף של היום: ${dafLabel}`,
  };
}
