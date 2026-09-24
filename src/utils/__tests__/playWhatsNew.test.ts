const {
  formatPlayWhatsNewText,
  PLAY_WHATS_NEW_MAX_CHARS,
} = require('../../../scripts/loadWhatsNewEntries');

describe('formatPlayWhatsNewText', () => {
  it('returns Hebrew bullets for a known version under the Play limit', () => {
    const text = formatPlayWhatsNewText('1.1.6');
    expect(text.length).toBeGreaterThan(0);
    expect(text.length).toBeLessThanOrEqual(PLAY_WHATS_NEW_MAX_CHARS);
    expect(text).toContain('•');
  });

  it('returns empty for an unknown version', () => {
    expect(formatPlayWhatsNewText('0.0.0')).toBe('');
  });
});
