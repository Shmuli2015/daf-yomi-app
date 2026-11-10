import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import {
  validateSupportFormAttachments,
  type SupportFormAttachmentPayload,
} from '../utils/supportFormAttachment';
import {
  SUPPORT_FORM_MESSAGE_MAX_LENGTH,
  hasSupportFormFieldErrors,
  isSupportFormCategory,
  isValidIsraeliPhone,
  isValidSupportEmail,
  normalizeIsraeliPhoneInput,
  validateSupportFormInput,
  type SupportFormCategory,
  type SupportFormInput,
} from '../utils/supportFormValidation';

export type SupportFormSubmitError =
  | 'not_configured'
  | 'validation'
  | 'network'
  | 'rate_limited'
  | 'server';

export type SupportFormSubmitResult =
  | { ok: true }
  | { ok: false; error: SupportFormSubmitError };

export type SupportFormSubmitPayload = {
  category: SupportFormCategory;
  message: string;
  replyEmail?: string;
  phone?: string;
  appVersion: string;
  platform: string;
  honeypot?: string;
  subjectOverride?: string;
  attachments?: SupportFormAttachmentPayload[];
};

const SUPPORT_FORM_ERROR_MESSAGES: Record<SupportFormSubmitError, string> = {
  not_configured: 'שליחה ישירה אינה זמינה כרגע. אפשר לפתוח את אפליקציית המייל ולשלוח משם.',
  validation: 'בדקו את השדות ונסחו שוב.',
  network: 'לא הצלחנו להתחבר. בדקו את הרשת או פתחו את אפליקציית המייל.',
  rate_limited: 'הגעתם למגבלת השליחה כרגע. אפשר לפתוח את אפליקציית המייל ולשלוח משם.',
  server: 'השליחה נכשלה. אפשר לפתוח את אפליקציית המייל ולשלוח משם.',
};

export function getSupportFormErrorMessage(error: SupportFormSubmitError): string {
  return SUPPORT_FORM_ERROR_MESSAGES[error];
}

export function resolveSupportFormUrl(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.supportFormUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
    return fromExtra.trim();
  }
  const fromEnv = process.env.EXPO_PUBLIC_SUPPORT_FORM_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return undefined;
}

export function isSupportFormConfigured(): boolean {
  return Boolean(resolveSupportFormUrl());
}

export function getSupportFormAppVersion(): string {
  const version = Constants.expoConfig?.version;
  if (typeof version === 'string' && version.length > 0) {
    return version;
  }
  return 'unknown';
}

export function getSupportFormPlatform(): string {
  return `${Platform.OS} ${String(Platform.Version)}`;
}

export function buildSupportFormPayload(input: SupportFormInput & {
  subjectOverride?: string;
  honeypot?: string;
  attachments?: SupportFormAttachmentPayload[];
}): SupportFormSubmitPayload | null {
  const errors = validateSupportFormInput(input);
  if (hasSupportFormFieldErrors(errors)) {
    return null;
  }
  if (validateSupportFormAttachments(input.attachments)) {
    return null;
  }

  const replyEmail = input.replyEmail.trim();
  const phone = input.phone.trim();
  const payload: SupportFormSubmitPayload = {
    category: input.category,
    message: input.message.trim(),
    appVersion: getSupportFormAppVersion(),
    platform: getSupportFormPlatform(),
  };

  if (replyEmail) {
    payload.replyEmail = replyEmail;
  }
  if (phone) {
    payload.phone = normalizeIsraeliPhoneInput(phone);
  }
  if (input.subjectOverride?.trim()) {
    payload.subjectOverride = input.subjectOverride.trim();
  }
  if (input.honeypot) {
    payload.honeypot = input.honeypot;
  }
  if (input.attachments && input.attachments.length > 0) {
    payload.attachments = input.attachments.map((item) => ({
      filename: item.filename,
      contentType: item.contentType,
      contentBase64: item.contentBase64,
    }));
  }

  return payload;
}

function mapHttpStatusToError(status: number): SupportFormSubmitError {
  if (status === 429) {
    return 'rate_limited';
  }
  if (status === 400 || status === 422) {
    return 'validation';
  }
  return 'server';
}

export async function submitSupportForm(
  payload: SupportFormSubmitPayload,
): Promise<SupportFormSubmitResult> {
  const url = resolveSupportFormUrl();
  if (!url) {
    return { ok: false, error: 'not_configured' };
  }

  if (!isSupportFormCategory(payload.category)) {
    return { ok: false, error: 'validation' };
  }
  const message = payload.message.trim();
  if (!message || message.length > SUPPORT_FORM_MESSAGE_MAX_LENGTH) {
    return { ok: false, error: 'validation' };
  }
  if (payload.replyEmail && !isValidSupportEmail(payload.replyEmail)) {
    return { ok: false, error: 'validation' };
  }
  if (payload.phone && !isValidIsraeliPhone(payload.phone)) {
    return { ok: false, error: 'validation' };
  }
  if (validateSupportFormAttachments(payload.attachments)) {
    return { ok: false, error: 'validation' };
  }

  const hasAttachments = Boolean(payload.attachments && payload.attachments.length > 0);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      hasAttachments ? 60000 : undefined,
    );

    if (response.ok) {
      return { ok: true };
    }
    return { ok: false, error: mapHttpStatusToError(response.status) };
  } catch {
    return { ok: false, error: 'network' };
  }
}
