export const READER_FONT_SIZE_MIN = 14;
export const READER_FONT_SIZE_MAX = 30;
export const READER_FONT_SIZE_DEFAULT = 18;
export const READER_FONT_SIZE_STEP = 2;

export function clampReaderFontSize(value: number): number {
  if (!Number.isFinite(value)) {
    return READER_FONT_SIZE_DEFAULT;
  }
  const stepped = Math.round(value / READER_FONT_SIZE_STEP) * READER_FONT_SIZE_STEP;
  return Math.min(READER_FONT_SIZE_MAX, Math.max(READER_FONT_SIZE_MIN, stepped));
}

export function increaseReaderFontSize(current: number): number {
  return clampReaderFontSize(current + READER_FONT_SIZE_STEP);
}

export function decreaseReaderFontSize(current: number): number {
  return clampReaderFontSize(current - READER_FONT_SIZE_STEP);
}
