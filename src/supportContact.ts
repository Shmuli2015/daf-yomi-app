export const SUPPORT_EMAIL = 'support.masa.daf@gmail.com';

export const PRIVACY_POLICY_URL = 'https://shmuli2015.github.io/daf-yomi-app/privacy.html';

const SUPPORT_MAIL_SUBJECT = 'מסע דף, יצירת קשר / הצעה לשיפור';

const GUIDE_QUESTION_SUBJECT_PREFIX = 'מסע דף, שאלה מהמדריך: ';

export function getSupportMailtoUrl(subject: string = SUPPORT_MAIL_SUBJECT): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function getGuideQuestionSubject(question: string): string {
  return `${GUIDE_QUESTION_SUBJECT_PREFIX}${question.trim()}`;
}
