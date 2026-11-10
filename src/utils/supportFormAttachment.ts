export const SUPPORT_FORM_ATTACHMENT_MAX_BYTES = 900_000;
export const SUPPORT_FORM_ATTACHMENT_MAX_BASE64_LENGTH = Math.ceil(
  (SUPPORT_FORM_ATTACHMENT_MAX_BYTES * 4) / 3,
) + 8;
export const SUPPORT_FORM_ATTACHMENT_MAX_DIMENSION = 1280;
export const SUPPORT_FORM_ATTACHMENT_JPEG_QUALITY = 0.72;
export const SUPPORT_FORM_ATTACHMENT_MAX_COUNT = 3;

export const SUPPORT_FORM_ATTACHMENT_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type SupportFormAttachmentContentType =
  (typeof SUPPORT_FORM_ATTACHMENT_CONTENT_TYPES)[number];

export type SupportFormAttachmentPayload = {
  filename: string;
  contentType: SupportFormAttachmentContentType;
  contentBase64: string;
};

export type SupportFormAttachmentDraft = SupportFormAttachmentPayload & {
  id: string;
  previewUri: string;
};

export function isSupportFormAttachmentContentType(
  value: unknown,
): value is SupportFormAttachmentContentType {
  return (
    value === 'image/jpeg' || value === 'image/png' || value === 'image/webp'
  );
}

export function sanitizeSupportFormAttachmentFilename(raw: string): string {
  const trimmed = raw.trim().replace(/[\\/]+/g, '-');
  const cleaned = trimmed
    .replace(/[^\w.\u0590-\u05FF-]+/g, '_')
    .replace(/^[.\-_]+/, '')
    .replace(/\.+/g, '.');
  if (!cleaned) {
    return 'screenshot.jpg';
  }
  return cleaned.slice(0, 120);
}

export function estimateBase64DecodedBytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function validateSupportFormAttachmentPayload(
  attachment: SupportFormAttachmentPayload | undefined,
): string | null {
  if (!attachment) {
    return null;
  }
  if (!isSupportFormAttachmentContentType(attachment.contentType)) {
    return 'סוג הקובץ אינו נתמך. בחרו תמונת JPEG, PNG או WebP.';
  }
  const filename = sanitizeSupportFormAttachmentFilename(attachment.filename);
  if (!filename) {
    return 'שם הקובץ אינו תקין.';
  }
  const base64 = attachment.contentBase64.trim();
  if (!base64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) {
    return 'התמונה אינה תקינה. נסו לבחור שוב.';
  }
  if (base64.length > SUPPORT_FORM_ATTACHMENT_MAX_BASE64_LENGTH) {
    return 'התמונה גדולה מדי. נסו תמונה קטנה יותר.';
  }
  if (estimateBase64DecodedBytes(base64) > SUPPORT_FORM_ATTACHMENT_MAX_BYTES) {
    return 'התמונה גדולה מדי. נסו תמונה קטנה יותר.';
  }
  return null;
}

export function validateSupportFormAttachments(
  attachments: SupportFormAttachmentPayload[] | undefined,
): string | null {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  if (attachments.length > SUPPORT_FORM_ATTACHMENT_MAX_COUNT) {
    return `אפשר לצרף עד ${SUPPORT_FORM_ATTACHMENT_MAX_COUNT} תמונות.`;
  }
  for (const attachment of attachments) {
    const error = validateSupportFormAttachmentPayload(attachment);
    if (error) {
      return error;
    }
  }
  return null;
}
