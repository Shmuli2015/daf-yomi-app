import { decodeHtmlBytes, decodeWindows1255 } from '../windows1255';

describe('decodeWindows1255', () => {
  it('decodes Hebrew letters from the windows-1255 range', () => {
    const bytes = Uint8Array.from([0xe0, 0xe1, 0xe2]);
    expect(decodeWindows1255(bytes)).toBe('אבג');
  });

  it('keeps ASCII intact', () => {
    const bytes = Uint8Array.from([0x48, 0x69, 0x21]);
    expect(decodeWindows1255(bytes)).toBe('Hi!');
  });
});

describe('decodeHtmlBytes', () => {
  it('decodes Hebrew windows-1255 bytes', () => {
    const bytes = Uint8Array.from([0xe0, 0xe1, 0xe2, 0x20, 0x48, 0x69]);
    expect(decodeHtmlBytes(bytes)).toBe('אבג Hi');
  });
});
