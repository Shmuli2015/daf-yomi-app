import {
  attachmentFilename,
  boundedMeta,
  decodeBase64,
  detectImageType,
  getClientIp,
  isWithinEmailLength,
  readLimitedJson,
  resolveSubject,
} from './requestGuards';

type SupportFormCategory = 'bug' | 'question' | 'suggestion';
type SupportFormAttachmentContentType = 'image/jpeg' | 'image/png' | 'image/webp';

type SupportFormAttachmentRequest = {
  filename?: unknown;
  contentType?: unknown;
  contentBase64?: unknown;
};

type SupportFormRequest = {
  category?: unknown;
  message?: unknown;
  replyEmail?: unknown;
  phone?: unknown;
  appVersion?: unknown;
  platform?: unknown;
  honeypot?: unknown;
  subjectOverride?: unknown;
  attachment?: SupportFormAttachmentRequest;
  attachments?: unknown;
};

type RateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type Env = {
  RESEND_API_KEY: string;
  SUPPORT_TO_EMAIL: string;
  SUPPORT_FROM_EMAIL: string;
  SUPPORT_RATE_LIMITER?: RateLimiter;
};

const MESSAGE_MAX_LENGTH = 4000;
const ATTACHMENT_MAX_BYTES = 900_000;
const ATTACHMENT_MAX_BASE64_LENGTH = Math.ceil((ATTACHMENT_MAX_BYTES * 4) / 3) + 8;
const ATTACHMENT_MAX_COUNT = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CATEGORY_LABELS: Record<SupportFormCategory, string> = {
  bug: 'באג',
  question: 'שאלה',
  suggestion: 'הצעה לשיפור',
};

const CATEGORY_SUBJECTS: Record<SupportFormCategory, string> = {
  bug: 'מסע דף: דיווח על באג',
  question: 'מסע דף: שאלה',
  suggestion: 'מסע דף: הצעה לשיפור',
};

const rateLimitByIp = new Map<string, { count: number; resetAt: number }>();

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(
  request: Request,
  body: Record<string, unknown>,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function isCategory(value: unknown): value is SupportFormCategory {
  return value === 'bug' || value === 'question' || value === 'suggestion';
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

function normalizeIsraeliPhone(raw: string): string {
  let digits = raw.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+972')) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith('972') && digits.length >= 11) {
    digits = `0${digits.slice(3)}`;
  }
  return digits;
}

function isValidIsraeliPhone(raw: string): boolean {
  const digits = normalizeIsraeliPhone(raw);
  if (!digits || !/^\d+$/.test(digits)) {
    return false;
  }
  if (/^05\d{8}$/.test(digits)) {
    return true;
  }
  return /^0(?:2|3|4|8|9)\d{7}$/.test(digits);
}

function isMemoryRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitByIp.get(ip);
  if (!existing || existing.resetAt <= now) {
    rateLimitByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return true;
  }
  existing.count += 1;
  rateLimitByIp.set(ip, existing);
  return false;
}

async function isRateLimited(ip: string, env: Env): Promise<boolean> {
  if (env.SUPPORT_RATE_LIMITER) {
    const { success } = await env.SUPPORT_RATE_LIMITER.limit({ key: ip });
    return !success;
  }
  return isMemoryRateLimited(ip);
}

function isAttachmentContentType(value: unknown): value is SupportFormAttachmentContentType {
  return value === 'image/jpeg' || value === 'image/png' || value === 'image/webp';
}

function estimateBase64DecodedBytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

type ParsedAttachment = {
  filename: string;
  contentType: SupportFormAttachmentContentType;
  content: string;
};

function parseAttachment(
  raw: SupportFormAttachmentRequest | undefined,
): { ok: true; value?: ParsedAttachment } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: true };
  }

  const contentBase64 = asTrimmedString(raw.contentBase64);
  const contentTypeRaw = asTrimmedString(raw.contentType);
  const filenameRaw = asTrimmedString(raw.filename);

  if (!contentBase64 && !contentTypeRaw && !filenameRaw) {
    return { ok: true };
  }

  if (!isAttachmentContentType(contentTypeRaw)) {
    return { ok: false, error: 'invalid_attachment' };
  }
  if (!contentBase64 || !/^[A-Za-z0-9+/=]+$/.test(contentBase64)) {
    return { ok: false, error: 'invalid_attachment' };
  }
  if (contentBase64.length > ATTACHMENT_MAX_BASE64_LENGTH) {
    return { ok: false, error: 'invalid_attachment' };
  }
  if (estimateBase64DecodedBytes(contentBase64) > ATTACHMENT_MAX_BYTES) {
    return { ok: false, error: 'invalid_attachment' };
  }

  const bytes = decodeBase64(contentBase64);
  const detected = bytes ? detectImageType(bytes) : null;
  if (!bytes || bytes.byteLength > ATTACHMENT_MAX_BYTES || detected !== contentTypeRaw) {
    return { ok: false, error: 'invalid_attachment' };
  }

  return {
    ok: true,
    value: {
      filename: attachmentFilename(filenameRaw || 'screenshot', detected),
      contentType: detected,
      content: contentBase64,
    },
  };
}

function parseAttachments(
  body: SupportFormRequest,
): { ok: true; values: ParsedAttachment[] } | { ok: false; error: string } {
  const collected: ParsedAttachment[] = [];

  if (Array.isArray(body.attachments)) {
    if (body.attachments.length > ATTACHMENT_MAX_COUNT) {
      return { ok: false, error: 'invalid_attachment' };
    }
    for (const item of body.attachments) {
      const parsed = parseAttachment(item as SupportFormAttachmentRequest);
      if (!parsed.ok) {
        return parsed;
      }
      if (parsed.value) {
        collected.push(parsed.value);
      }
    }
  } else if (body.attachment) {
    const parsed = parseAttachment(body.attachment);
    if (!parsed.ok) {
      return parsed;
    }
    if (parsed.value) {
      collected.push(parsed.value);
    }
  }

  if (collected.length > ATTACHMENT_MAX_COUNT) {
    return { ok: false, error: 'invalid_attachment' };
  }

  return { ok: true, values: collected };
}

type EmailContentInput = {
  category: SupportFormCategory;
  message: string;
  replyEmail: string;
  phone: string;
  appVersion: string;
  platform: string;
  attachmentCount: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function attachmentSummary(count: number): string {
  if (count <= 0) {
    return '';
  }
  if (count === 1) {
    return 'צורפה תמונה אחת להודעה.';
  }
  return `צורפו ${count} תמונות להודעה.`;
}

function buildEmailText(input: EmailContentInput): string {
  const lines = [
    `סוג פנייה: ${CATEGORY_LABELS[input.category]}`,
    '',
    input.message,
  ];
  if (input.replyEmail) {
    lines.push('', `אימייל לחזרה: ${input.replyEmail}`);
  }
  if (input.phone) {
    lines.push(`טלפון: ${input.phone}`);
  }
  const attachmentsLine = attachmentSummary(input.attachmentCount);
  if (attachmentsLine) {
    lines.push('', attachmentsLine);
  }
  if (input.appVersion || input.platform) {
    lines.push('');
    if (input.appVersion) {
      lines.push(`גרסת אפליקציה: ${input.appVersion}`);
    }
    if (input.platform) {
      lines.push(`מערכת הפעלה: ${input.platform}`);
    }
  }
  return lines.join('\n');
}

function buildDetailRow(label: string, value: string, valueDir: 'rtl' | 'ltr' = 'rtl'): string {
  return `
    <tr>
      <td dir="rtl" align="right" style="padding:12px 0;border-top:1px solid #E8E8E8;text-align:right;direction:rtl;">
        <div dir="rtl" style="font-size:12px;line-height:18px;color:#666666;margin:0 0 3px 0;text-align:right;direction:rtl;">${escapeHtml(label)}</div>
        <div dir="${valueDir}" style="font-size:15px;line-height:22px;color:#111111;margin:0;word-break:break-word;text-align:right;direction:${valueDir};">${value}</div>
      </td>
    </tr>`;
}

function buildEmailHtml(input: EmailContentInput): string {
  const categoryLabel = CATEGORY_LABELS[input.category];
  const messageHtml = escapeHtml(input.message).replace(/\n/g, '<br />');
  const attachmentsLine = attachmentSummary(input.attachmentCount);
  const detailRows = [
    buildDetailRow('סוג פנייה', escapeHtml(categoryLabel)),
    input.replyEmail
      ? buildDetailRow('אימייל לחזרה', escapeHtml(input.replyEmail), 'ltr')
      : '',
    input.phone ? buildDetailRow('טלפון', escapeHtml(input.phone), 'ltr') : '',
    attachmentsLine ? buildDetailRow('קבצים מצורפים', escapeHtml(attachmentsLine)) : '',
    input.appVersion
      ? buildDetailRow('גרסת אפליקציה', escapeHtml(input.appVersion), 'ltr')
      : '',
    input.platform ? buildDetailRow('מערכת הפעלה', escapeHtml(input.platform), 'ltr') : '',
  ].join('');

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>פנייה חדשה ממסע דף</title>
  </head>
  <body dir="rtl" style="margin:0;padding:0;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right;">
    <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#FFFFFF;direction:rtl;text-align:right;">
      <tr>
        <td dir="rtl" align="center" style="padding:20px 12px;direction:rtl;text-align:center;">
          <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:560px;direction:rtl;text-align:right;">
            <tr>
              <td dir="rtl" align="right" style="padding:0 0 16px 0;border-bottom:2px solid #C9963C;text-align:right;direction:rtl;">
                <div dir="rtl" style="font-size:13px;line-height:18px;color:#666666;margin:0 0 4px 0;text-align:right;direction:rtl;">מסע דף</div>
                <div dir="rtl" style="font-size:20px;line-height:28px;font-weight:700;color:#111111;margin:0;text-align:right;direction:rtl;">פנייה חדשה מהאפליקציה</div>
              </td>
            </tr>
            <tr>
              <td dir="rtl" align="right" style="padding:18px 0 8px 0;text-align:right;direction:rtl;">
                <div dir="rtl" style="font-size:12px;line-height:18px;color:#666666;margin:0 0 6px 0;text-align:right;direction:rtl;">ההודעה</div>
                <div dir="rtl" style="font-size:16px;line-height:26px;color:#111111;text-align:right;direction:rtl;">
                  ${messageHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td dir="rtl" align="right" style="padding:8px 0 0 0;text-align:right;direction:rtl;">
                <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;direction:rtl;text-align:right;">
                  ${detailRows}
                </table>
              </td>
            </tr>
            <tr>
              <td dir="rtl" align="right" style="padding:18px 0 0 0;text-align:right;direction:rtl;">
                <div dir="rtl" style="font-size:12px;line-height:18px;color:#888888;margin:0;text-align:right;direction:rtl;">
                  נשלח אוטומטית מטופס התמיכה באפליקציית מסע דף.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse(request, { ok: false, error: 'method_not_allowed' }, 405);
    }

    const ip = getClientIp(request);
    if (await isRateLimited(ip, env)) {
      return jsonResponse(request, { ok: false, error: 'rate_limited' }, 429);
    }

    const parsedBody = await readLimitedJson(request);
    if (!parsedBody.ok) {
      const status = parsedBody.error === 'payload_too_large' ? 413 : 400;
      return jsonResponse(request, { ok: false, error: parsedBody.error }, status);
    }
    if (!parsedBody.value || typeof parsedBody.value !== 'object' || Array.isArray(parsedBody.value)) {
      return jsonResponse(request, { ok: false, error: 'invalid_json' }, 400);
    }
    const body = parsedBody.value as SupportFormRequest;

    const honeypot = asTrimmedString(body.honeypot);
    if (honeypot) {
      return jsonResponse(request, { ok: true }, 200);
    }

    if (!isCategory(body.category)) {
      return jsonResponse(request, { ok: false, error: 'invalid_category' }, 400);
    }

    const message = asTrimmedString(body.message);
    if (!message || message.length > MESSAGE_MAX_LENGTH) {
      return jsonResponse(request, { ok: false, error: 'invalid_message' }, 400);
    }

    const replyEmail = asTrimmedString(body.replyEmail);
    if (replyEmail && (!isWithinEmailLength(replyEmail) || !isValidEmail(replyEmail))) {
      return jsonResponse(request, { ok: false, error: 'invalid_email' }, 400);
    }

    const phoneRaw = asTrimmedString(body.phone);
    let phone = '';
    if (phoneRaw) {
      if (!isValidIsraeliPhone(phoneRaw)) {
        return jsonResponse(request, { ok: false, error: 'invalid_phone' }, 400);
      }
      phone = normalizeIsraeliPhone(phoneRaw);
    }

    const appVersion = boundedMeta(asTrimmedString(body.appVersion));
    const platform = boundedMeta(asTrimmedString(body.platform));
    if (appVersion === null || platform === null) {
      return jsonResponse(request, { ok: false, error: 'invalid_meta' }, 400);
    }
    const subject = resolveSubject(
      asTrimmedString(body.subjectOverride),
      CATEGORY_SUBJECTS[body.category],
    );
    if (!subject) {
      return jsonResponse(request, { ok: false, error: 'invalid_subject' }, 400);
    }
    const parsedAttachments = parseAttachments(body);
    if (!parsedAttachments.ok) {
      return jsonResponse(request, { ok: false, error: parsedAttachments.error }, 400);
    }

    if (!env.RESEND_API_KEY) {
      return jsonResponse(request, { ok: false, error: 'not_configured' }, 500);
    }

    const emailContent = {
      category: body.category,
      message,
      replyEmail,
      phone,
      appVersion,
      platform,
      attachmentCount: parsedAttachments.values.length,
    };
    const emailPayload: Record<string, unknown> = {
      from: env.SUPPORT_FROM_EMAIL,
      to: [env.SUPPORT_TO_EMAIL],
      subject,
      text: buildEmailText(emailContent),
      html: buildEmailHtml(emailContent),
    };
    if (replyEmail) {
      emailPayload.reply_to = replyEmail;
    }
    if (parsedAttachments.values.length > 0) {
      emailPayload.attachments = parsedAttachments.values.map((item) => ({
        filename: item.filename,
        content: item.content,
        content_type: item.contentType,
      }));
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (resendResponse.status === 429) {
      return jsonResponse(request, { ok: false, error: 'rate_limited' }, 429);
    }

    if (!resendResponse.ok) {
      return jsonResponse(request, { ok: false, error: 'send_failed' }, 502);
    }

    return jsonResponse(request, { ok: true }, 200);
  },
};
