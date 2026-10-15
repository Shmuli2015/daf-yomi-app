import {
  getStudyReminderTargetFromResponse,
  parseStudyReminderTarget,
} from '../studyReminderTarget';

const validTarget = { masechetEn: 'Berachot', masechetHe: 'ברכות', dafNum: 5, amud: 'a' as const };

describe('studyReminderTarget', () => {
  it('parses a valid payload object', () => {
    expect(parseStudyReminderTarget({ ...validTarget, scheduledFor: 1 })).toEqual(validTarget);
  });

  it('parses a JSON string payload', () => {
    expect(parseStudyReminderTarget(JSON.stringify(validTarget))).toEqual(validTarget);
  });

  it('rejects incomplete payloads', () => {
    expect(parseStudyReminderTarget({ masechetEn: 'Berachot' })).toBeNull();
    expect(parseStudyReminderTarget({ ...validTarget, amud: 'c' })).toBeNull();
    expect(parseStudyReminderTarget({ ...validTarget, dafNum: 0 })).toBeNull();
    expect(parseStudyReminderTarget(null)).toBeNull();
  });

  it('reads the target from a foreground response', () => {
    const response = { notification: { request: { content: { data: validTarget } } } };
    expect(getStudyReminderTargetFromResponse(response)).toEqual(validTarget);
  });

  it('reads the target from a background task payload', () => {
    const payload = {
      notificationResponse: { notification: { request: { content: { data: validTarget } } } },
    };
    expect(getStudyReminderTargetFromResponse(payload)).toEqual(validTarget);
  });

  it('returns null when the response carries no data', () => {
    expect(getStudyReminderTargetFromResponse({})).toBeNull();
    expect(getStudyReminderTargetFromResponse(undefined)).toBeNull();
  });
});
