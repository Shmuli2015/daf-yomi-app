import {
  clampReaderFontSize,
  decreaseReaderFontSize,
  increaseReaderFontSize,
  READER_FONT_SIZE_DEFAULT,
  READER_FONT_SIZE_MAX,
  READER_FONT_SIZE_MIN,
} from '../readerFontSize';

describe('clampReaderFontSize', () => {
  it('returns the default for non-finite values', () => {
    expect(clampReaderFontSize(Number.NaN)).toBe(READER_FONT_SIZE_DEFAULT);
    expect(clampReaderFontSize(Number.POSITIVE_INFINITY)).toBe(READER_FONT_SIZE_DEFAULT);
  });

  it('clamps to the allowed even range', () => {
    expect(clampReaderFontSize(10)).toBe(READER_FONT_SIZE_MIN);
    expect(clampReaderFontSize(40)).toBe(READER_FONT_SIZE_MAX);
    expect(clampReaderFontSize(19)).toBe(20);
    expect(clampReaderFontSize(20)).toBe(20);
  });
});

describe('increaseReaderFontSize and decreaseReaderFontSize', () => {
  it('steps by two within bounds', () => {
    expect(increaseReaderFontSize(18)).toBe(20);
    expect(decreaseReaderFontSize(18)).toBe(16);
    expect(increaseReaderFontSize(READER_FONT_SIZE_MAX)).toBe(READER_FONT_SIZE_MAX);
    expect(decreaseReaderFontSize(READER_FONT_SIZE_MIN)).toBe(READER_FONT_SIZE_MIN);
  });
});
