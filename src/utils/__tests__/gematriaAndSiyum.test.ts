import { parseDafInput } from '../gematria';

describe('gematria utility', () => {
  it('parses numeric digits', () => {
    expect(parseDafInput('2')).toBe(2);
    expect(parseDafInput('25')).toBe(25);
    expect(parseDafInput('104')).toBe(104);
  });

  it('parses Hebrew gematria letters', () => {
    expect(parseDafInput('ב')).toBe(2);
    expect(parseDafInput("ב'")).toBe(2);
    expect(parseDafInput('כה')).toBe(25);
    expect(parseDafInput('כ"ה')).toBe(25);
    expect(parseDafInput('קכ')).toBe(120);
  });

  it('returns null for invalid inputs', () => {
    expect(parseDafInput('')).toBeNull();
    expect(parseDafInput('abc')).toBeNull();
    expect(parseDafInput('-5')).toBeNull();
  });
});
