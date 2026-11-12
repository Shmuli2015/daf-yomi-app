import {
  buildSupportMailBody,
  getSupportMailSubject,
  type SupportMailDraft,
} from './utils/supportMailBody';

export const SUPPORT_EMAIL = 'support.masa.daf@gmail.com';

export const PRIVACY_POLICY_URL = 'https://shmuli2015.github.io/daf-yomi-app/privacy.html';

const SUPPORT_MAIL_SUBJECT = 'מסע דף, יצירת קשר / הצעה לשיפור';

export const GUIDE_QUESTION_SUBJECT_PREFIX = 'מסע דף, שאלה מהמדריך: ';

export function getSupportMailtoUrl(subject: string = SUPPORT_MAIL_SUBJECT, body?: string): string {
  let url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  if (body && body.trim().length > 0) {
    url += `&body=${encodeURIComponent(body)}`;
  }
  return url;
}

export function getGuideQuestionSubject(question: string): string {
  return `${GUIDE_QUESTION_SUBJECT_PREFIX}${question.trim()}`;
}

export function extractGuideTopic(subjectOrTopic: string | undefined): string | undefined {
  const trimmed = subjectOrTopic?.trim() ?? '';
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.startsWith(GUIDE_QUESTION_SUBJECT_PREFIX)) {
    const topic = trimmed.slice(GUIDE_QUESTION_SUBJECT_PREFIX.length).trim();
    return topic.length > 0 ? topic : undefined;
  }
  return trimmed;
}

export function getSupportMailtoUrlFromDraft(draft: SupportMailDraft): string {
  return getSupportMailtoUrl(getSupportMailSubject(draft), buildSupportMailBody(draft));
}
