import {
  SUPPORT_FORM_ATTACHMENT_MAX_COUNT,
  estimateBase64DecodedBytes,
  sanitizeSupportFormAttachmentFilename,
  validateSupportFormAttachmentPayload,
  validateSupportFormAttachments,
} from '../supportFormAttachment';

describe('supportFormAttachment', () => {
  it('sanitizes filenames', () => {
    expect(sanitizeSupportFormAttachmentFilename('../a/b screen.png')).toBe('a-b_screen.png');
    expect(sanitizeSupportFormAttachmentFilename('')).toBe('screenshot.jpg');
  });

  it('estimates decoded base64 size', () => {
    expect(estimateBase64DecodedBytes('AAAA')).toBe(3);
    expect(estimateBase64DecodedBytes('AAA=')).toBe(2);
    expect(estimateBase64DecodedBytes('AA==')).toBe(1);
  });

  it('rejects invalid attachments', () => {
    expect(
      validateSupportFormAttachmentPayload({
        filename: 'shot.jpg',
        contentType: 'image/gif' as 'image/jpeg',
        contentBase64: 'AAAA',
      }),
    ).toContain('אינו נתמך');

    expect(
      validateSupportFormAttachmentPayload({
        filename: 'shot.jpg',
        contentType: 'image/jpeg',
        contentBase64: '!!!',
      }),
    ).toContain('אינה תקינה');
  });

  it('accepts a valid small jpeg payload', () => {
    expect(
      validateSupportFormAttachmentPayload({
        filename: 'shot.jpg',
        contentType: 'image/jpeg',
        contentBase64: 'AAAA',
      }),
    ).toBeNull();
  });

  it('limits the number of attachments', () => {
    const item = {
      filename: 'shot.jpg',
      contentType: 'image/jpeg' as const,
      contentBase64: 'AAAA',
    };
    expect(
      validateSupportFormAttachments(
        Array.from({ length: SUPPORT_FORM_ATTACHMENT_MAX_COUNT + 1 }, () => item),
      ),
    ).toContain('עד');
  });
});
