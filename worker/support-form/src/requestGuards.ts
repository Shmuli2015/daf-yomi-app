export const MAX_BODY_BYTES = 4_500_000;
export const SUBJECT_MAX_LENGTH = 200;
export const EMAIL_MAX_LENGTH = 254;
export const META_MAX_LENGTH = 64;

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

const IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export type DetectedImageType = keyof typeof IMAGE_EXTENSIONS;

export function getClientIp(request: Request): string {
  const ip = request.headers.get('CF-Connecting-IP')?.trim() ?? '';
  if (!ip || ip.length > 64 || CONTROL_CHARS.test(ip)) {
    return 'unknown';
  }
  return ip;
}

export function hasControlChars(value: string): boolean {
  return CONTROL_CHARS.test(value);
}

export function capText(value: string, maxLength: number): string {
  const chars = Array.from(value);
  if (chars.length <= maxLength) {
    return value;
  }
  return chars.slice(0, maxLength).join('');
}

export function resolveSubject(override: string, fallback: string): string | null {
  if (!override) {
    return fallback;
  }
  const subject = capText(override, SUBJECT_MAX_LENGTH);
  if (hasControlChars(subject)) {
    return null;
  }
  return subject;
}

export function boundedMeta(value: string): string | null {
  if (!value) {
    return '';
  }
  if (Array.from(value).length > META_MAX_LENGTH || hasControlChars(value)) {
    return null;
  }
  return value;
}

export function isWithinEmailLength(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH;
}

export function decodeBase64(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

export function detectImageType(bytes: Uint8Array): DetectedImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

function attachmentStem(raw: string): string {
  const trimmed = raw.trim().replace(/[\\/]+/g, '-');
  const cleaned = trimmed
    .replace(/[^\w.\u0590-\u05FF-]+/g, '_')
    .replace(/^[.\-_]+/, '')
    .replace(/\.+/g, '.');
  const stem = cleaned.replace(/(?:\.[^.]+)+$/, '').replace(/\.+$/, '');
  return stem || 'screenshot';
}

export function attachmentFilename(raw: string, contentType: DetectedImageType): string {
  return `${attachmentStem(raw).slice(0, 100)}.${IMAGE_EXTENSIONS[contentType]}`;
}

export async function readLimitedJson(
  request: Request,
): Promise<
  { ok: true; value: unknown } | { ok: false; error: 'payload_too_large' | 'invalid_json' }
> {
  const declared = request.headers.get('Content-Length');
  if (declared !== null) {
    if (!/^\d{1,10}$/.test(declared) || Number(declared) > MAX_BODY_BYTES) {
      return { ok: false, error: 'payload_too_large' };
    }
  }

  if (!request.body) {
    return { ok: false, error: 'invalid_json' };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false, error: 'payload_too_large' };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, error: 'invalid_json' };
  }
}
