import {
  getNextReaderTheme,
  getReaderThemeLabel,
  getReaderThemePalette,
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

describe('getReaderThemeLabel', () => {
  it('returns Hebrew labels for reader themes', () => {
    expect(getReaderThemeLabel('light')).toBe('בהיר');
    expect(getReaderThemeLabel('sepia')).toBe('ספיה');
    expect(getReaderThemeLabel('dark')).toBe('כהה');
  });
});

describe('getReaderThemePalette', () => {
  it('includes hierarchical section surfaces for each reader theme', () => {
    const light = getReaderThemePalette('light');
    const sepia = getReaderThemePalette('sepia');
    const dark = getReaderThemePalette('dark');

    expect(light.mishnahSurfaceColor).toBe('rgba(180, 83, 9, 0.12)');
    expect(light.commentarySurfaceColor).toBe('rgba(180, 83, 9, 0.06)');
    expect(light.accentLight).toBe('rgba(180, 83, 9, 0.08)');

    expect(sepia.mishnahSurfaceColor).toBe('rgba(180, 83, 9, 0.14)');
    expect(sepia.commentarySurfaceColor).toBe('rgba(180, 83, 9, 0.07)');
    expect(sepia.accentBorder).toBe('rgba(180, 83, 9, 0.20)');

    expect(dark.mishnahSurfaceColor).toBe('rgba(201, 150, 60, 0.18)');
    expect(dark.commentarySurfaceColor).toBe('rgba(201, 150, 60, 0.10)');
    expect(dark.accentBorder).toBe('rgba(201, 150, 60, 0.25)');
  });
});
