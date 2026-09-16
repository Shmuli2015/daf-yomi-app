import { getSnoozeReminderCopy, getStudyReminderCopy, getTodayDafLabel } from '../notificationCopy';

describe('notificationCopy', () => {
  const date = new Date(2026, 8, 16);

  it('uses a fixed study reminder with the daf in the body', () => {
    const label = getTodayDafLabel(date);
    const copy = getStudyReminderCopy(date);
    expect(copy.title).toBe('תזכורת ללימוד הדף היומי');
    expect(copy.body).toBe(`הגיע זמן הלימוד. הדף של היום: ${label}`);
  });

  it('keeps the same study reminder title across days', () => {
    const titles = new Set(
      [0, 1, 2, 3, 4].map(offset => getStudyReminderCopy(new Date(2026, 0, 1 + offset)).title),
    );
    expect(titles).toEqual(new Set(['תזכורת ללימוד הדף היומי']));
  });

  it('uses a fixed snooze reminder with the daf in the body', () => {
    const label = getTodayDafLabel(date);
    const copy = getSnoozeReminderCopy(date);
    expect(copy.title).toBe('תזכורת נוספת ללימוד');
    expect(copy.body).toBe(`הגיע זמן הלימוד. הדף של היום: ${label}`);
  });
});
