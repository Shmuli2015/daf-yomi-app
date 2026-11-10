import {
  SUPPORT_FORM_CATEGORY_LABELS,
  SUPPORT_FORM_SUBJECTS,
  type SupportFormCategory,
} from './supportFormValidation';

export type SupportMailDraft = {
  category: SupportFormCategory;
  message: string;
  replyEmail?: string;
  phone?: string;
  appVersion?: string;
  platform?: string;
  subjectOverride?: string;
};

export function getSupportMailSubject(draft: SupportMailDraft): string {
  if (draft.subjectOverride?.trim()) {
    return draft.subjectOverride.trim();
  }
  return SUPPORT_FORM_SUBJECTS[draft.category];
}

export function buildSupportMailBody(draft: SupportMailDraft): string {
  const lines = [
    `סוג פנייה: ${SUPPORT_FORM_CATEGORY_LABELS[draft.category]}`,
    '',
    draft.message.trim(),
  ];

  const replyEmail = draft.replyEmail?.trim();
  if (replyEmail) {
    lines.push('', `אימייל לחזרה: ${replyEmail}`);
  }

  const phone = draft.phone?.trim();
  if (phone) {
    lines.push(`טלפון: ${phone}`);
  }

  if (draft.appVersion || draft.platform) {
    lines.push('');
    if (draft.appVersion) {
      lines.push(`גרסת אפליקציה: ${draft.appVersion}`);
    }
    if (draft.platform) {
      lines.push(`מערכת הפעלה: ${draft.platform}`);
    }
  }

  return lines.join('\n');
}
