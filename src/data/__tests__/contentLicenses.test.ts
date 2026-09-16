import {
  COMMENTARY_ATTRIBUTION_SHORT,
  CONTENT_LICENSES,
  MISHNAH_ATTRIBUTION_SHORT,
  READER_ATTRIBUTION_SHORT,
  SHEKALIM_ATTRIBUTION_SHORT,
  SHEKALIM_STEINSALTZ_ATTRIBUTION_SHORT,
  gemaraAttributionForTref,
  steinsaltzAttributionForTref,
} from '../contentLicenses';

describe('contentLicenses', () => {
  it('uses Guggenheimer CC BY for Jerusalem Talmud Shekalim gemara', () => {
    expect(gemaraAttributionForTref('Jerusalem_Talmud_Shekalim.1.1.1-5')).toBe(
      SHEKALIM_ATTRIBUTION_SHORT,
    );
    expect(CONTENT_LICENSES.some((entry) => entry.id === 'shekalim-text')).toBe(true);
  });

  it('uses mishnah attribution for Kinnim and Middot', () => {
    expect(gemaraAttributionForTref('Mishnah_Kinnim.1.1-2')).toBe(MISHNAH_ATTRIBUTION_SHORT);
    expect(gemaraAttributionForTref('Mishnah_Middot.4.5-5.4')).toBe(MISHNAH_ATTRIBUTION_SHORT);
  });

  it('uses Koren attribution for Bavli gemara and Steinsaltz', () => {
    expect(gemaraAttributionForTref('Berakhot.2a')).toBe(READER_ATTRIBUTION_SHORT);
    expect(steinsaltzAttributionForTref('Berakhot.2a')).toBe(COMMENTARY_ATTRIBUTION_SHORT);
  });

  it('does not claim CC BY-NC for Steinsaltz on Shekalim', () => {
    expect(steinsaltzAttributionForTref('Jerusalem_Talmud_Shekalim.1.1')).toBe(
      SHEKALIM_STEINSALTZ_ATTRIBUTION_SHORT,
    );
    const shekalimSteinsaltz = CONTENT_LICENSES.find((entry) => entry.id === 'steinsaltz-shekalim');
    expect(shekalimSteinsaltz?.licenseLabel).toBe('לא צוין בספריא');
  });
});
