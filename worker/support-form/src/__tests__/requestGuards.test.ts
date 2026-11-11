import {
  MAX_BODY_BYTES,
  SUBJECT_MAX_LENGTH,
  attachmentFilename,
  decodeBase64,
  detectImageType,
  getClientIp,
  readLimitedJson,
  resolveSubject,
} from '../requestGuards';

describe('support form request guards', () => {
  it('reads the client ip only from Cloudflare', () => {
    const request = new Request('https://example.com', {
      headers: {
        'CF-Connecting-IP': '203.0.113.8',
        'X-Forwarded-For': '198.51.100.4',
      },
    });
    expect(getClientIp(request)).toBe('203.0.113.8');
  });

  it('ignores a spoofed forwarded header when Cloudflare did not set an ip', () => {
    const request = new Request('https://example.com', {
      headers: { 'X-Forwarded-For': '198.51.100.4' },
    });
    expect(getClientIp(request)).toBe('unknown');
  });

  it('keeps a guide subject and drops a subject with a line break', () => {
    expect(resolveSubject('מסע דף, שאלה מהמדריך: סימון חצי דף', 'מסע דף: שאלה')).toBe(
      'מסע דף, שאלה מהמדריך: סימון חצי דף',
    );
    expect(resolveSubject(`באג\nBcc: victim@example.com`, 'מסע דף: דיווח על באג')).toBeNull();
  });

  it('caps a long subject', () => {
    const subject = resolveSubject('א'.repeat(SUBJECT_MAX_LENGTH + 40), 'מסע דף: שאלה');
    expect(subject).toBe('א'.repeat(SUBJECT_MAX_LENGTH));
  });

  it('accepts a jpeg and rejects bytes that are not an image', () => {
    expect(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg');
    expect(detectImageType(Uint8Array.from([0x3c, 0x68, 0x74, 0x6d, 0x6c]))).toBeNull();
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(detectImageType(png)).toBe('image/png');
    const webp = new Uint8Array(12);
    webp.set(Uint8Array.from([0x52, 0x49, 0x46, 0x46]), 0);
    webp.set(Uint8Array.from([0x57, 0x45, 0x42, 0x50]), 8);
    expect(detectImageType(webp)).toBe('image/webp');
  });

  it('names the attachment from the detected image type', () => {
    expect(attachmentFilename('report.html', 'image/jpeg')).toBe('report.jpg');
    expect(attachmentFilename('shot.jpg.exe', 'image/png')).toBe('shot.png');
    expect(attachmentFilename('../payload.exe', 'image/webp')).toBe('payload.webp');
  });

  it('decodes a real jpeg prefix', () => {
    const bytes = decodeBase64('/9j/AA==');
    expect(bytes && detectImageType(bytes)).toBe('image/jpeg');
  });

  it('rejects a body larger than the cap', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      body: 'x'.repeat(MAX_BODY_BYTES + 1),
    });
    await expect(readLimitedJson(request)).resolves.toEqual({
      ok: false,
      error: 'payload_too_large',
    });
  });

  it('parses a small json body', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'bug' }),
    });
    await expect(readLimitedJson(request)).resolves.toEqual({
      ok: true,
      value: { category: 'bug' },
    });
  });
});
