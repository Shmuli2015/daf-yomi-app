export type SupportFormCategory = 'bug' | 'question' | 'suggestion';

export const SUPPORT_FORM_CATEGORIES: SupportFormCategory[] = ['bug', 'question', 'suggestion'];

export const SUPPORT_FORM_CATEGORY_LABELS: Record<SupportFormCategory, string> = {
  bug: 'באג',
  question: 'שאלה',
  suggestion: 'הצעה לשיפור',
};

export const SUPPORT_FORM_MESSAGE_PLACEHOLDERS: Record<SupportFormCategory, string> = {
  bug: 'מה קרה? באיזה מסך? מה ציפיתם שיקרה?',
  question: 'מה תרצו לדעת? נשמח לעזור.',
  suggestion: 'איזה שיפור או תכונה חדשה תרצו לראות באפליקציה?',
};

export const SUPPORT_FORM_SUBJECTS: Record<SupportFormCategory, string> = {
  bug: 'מסע דף: דיווח על באג',
  question: 'מסע דף: שאלה',
  suggestion: 'מסע דף: הצעה לשיפור',
};

export const SUPPORT_FORM_MESSAGE_MAX_LENGTH = 4000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isSupportFormCategory(value: unknown): value is SupportFormCategory {
  return value === 'bug' || value === 'question' || value === 'suggestion';
}

export function isValidSupportEmail(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  return EMAIL_PATTERN.test(trimmed);
}

export function normalizeIsraeliPhoneInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }
  let digits = trimmed.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+972')) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith('972') && digits.length >= 11) {
    digits = `0${digits.slice(3)}`;
  }
  return digits;
}

export function isValidIsraeliPhone(raw: string): boolean {
  const digits = normalizeIsraeliPhoneInput(raw);
  if (!digits || !/^\d+$/.test(digits)) {
    return false;
  }
  if (/^05\d{8}$/.test(digits)) {
    return true;
  }
  return /^0(?:2|3|4|8|9)\d{7}$/.test(digits);
}

export type SupportFormFieldErrors = {
  message?: string;
  replyEmail?: string;
  phone?: string;
};

export type SupportFormInput = {
  category: SupportFormCategory;
  message: string;
  replyEmail: string;
  phone: string;
};

export function validateSupportFormInput(input: SupportFormInput): SupportFormFieldErrors {
  const errors: SupportFormFieldErrors = {};
  const message = input.message.trim();
  if (!message) {
    errors.message = 'כתבו את ההודעה לפני השליחה';
  } else if (message.length > SUPPORT_FORM_MESSAGE_MAX_LENGTH) {
    errors.message = `ההודעה ארוכה מדי (עד ${SUPPORT_FORM_MESSAGE_MAX_LENGTH} תווים)`;
  }

  const replyEmail = input.replyEmail.trim();
  if (replyEmail && !isValidSupportEmail(replyEmail)) {
    errors.replyEmail = 'כתובת האימייל אינה תקינה';
  }

  const phone = input.phone.trim();
  if (phone && !isValidIsraeliPhone(phone)) {
    errors.phone = 'הזינו מספר טלפון תקין';
  }

  return errors;
}

export function hasSupportFormFieldErrors(errors: SupportFormFieldErrors): boolean {
  return Boolean(errors.message || errors.replyEmail || errors.phone);
}
