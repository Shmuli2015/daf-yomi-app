/** כתובת תמיכה, משוב והצעות לשיפור */
export const SUPPORT_EMAIL = 'support.masa.daf@gmail.com';

const SUPPORT_MAIL_SUBJECT = 'מסע דף, יצירת קשר / הצעה לשיפור';

export function getSupportMailtoUrl(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_MAIL_SUBJECT)}`;
}
