export const SUPPORT_EMAIL = 'support.masa.daf@gmail.com';

export const PRIVACY_POLICY_URL = 'https://shmuli2015.github.io/daf-yomi-app/privacy.html';

const SUPPORT_MAIL_SUBJECT = 'מסע דף, יצירת קשר / הצעה לשיפור';

export function getSupportMailtoUrl(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_MAIL_SUBJECT)}`;
}
