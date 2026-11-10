import { buildSupportMailBody, getSupportMailSubject } from '../supportMailBody';

describe('supportMailBody', () => {
  it('builds a Hebrew mail body with optional contact fields', () => {
    const body = buildSupportMailBody({
      category: 'bug',
      message: 'מסך ההגדרות נתקע',
      replyEmail: 'user@example.com',
      phone: '0501234567',
      appVersion: '1.2.9',
      platform: 'android 34',
    });

    expect(body).toContain('סוג פנייה: באג');
    expect(body).toContain('מסך ההגדרות נתקע');
    expect(body).toContain('אימייל לחזרה: user@example.com');
    expect(body).toContain('טלפון: 0501234567');
    expect(body).toContain('גרסת אפליקציה: 1.2.9');
  });

  it('prefers an override subject from the guide', () => {
    expect(
      getSupportMailSubject({
        category: 'question',
        message: 'שאלה',
        subjectOverride: 'מסע דף, שאלה מהמדריך: סימון חצי דף',
      }),
    ).toBe('מסע דף, שאלה מהמדריך: סימון חצי דף');
  });
});
