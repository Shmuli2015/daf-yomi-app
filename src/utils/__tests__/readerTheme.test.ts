import {
  getNextReaderTheme,
  resolveEffectiveReaderTheme,
} from '../readerTheme';

describe('resolveEffectiveReaderTheme', () => {
  it('falls back to system dark mode when setting is unset or system', () => {
    expect(resolveEffectiveReaderTheme(null, false)).toBe('light');
    expect(resolveEffectiveReaderTheme(undefined, true)).toBe('dark');
    expect(resolveEffectiveReaderTheme('system', false)).toBe('light');
    expect(resolveEffectiveReaderTheme('system', true)).toBe('dark');
  });

  it('respects explicitly configured themes regardless of system darkness', () => {
    expect(resolveEffectiveReaderTheme('sepia', false)).toBe('sepia');
    expect(resolveEffectiveReaderTheme('sepia', true)).toBe('sepia');
    expect(resolveEffectiveReaderTheme('dark', false)).toBe('dark');
    expect(resolveEffectiveReaderTheme('light', true)).toBe('light');
  });
});

describe('getNextReaderTheme', () => {
  it('cycles from light to sepia, dark, and back to light', () => {
    expect(getNextReaderTheme('light')).toBe('sepia');
    expect(getNextReaderTheme('sepia')).toBe('dark');
    expect(getNextReaderTheme('dark')).toBe('light');
  });
});
