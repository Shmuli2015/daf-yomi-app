import {
  COMMENTARY_ATTRIBUTION_SHORT,
  CONTENT_LICENSES,
  MISHNAH_ATTRIBUTION_SHORT,
  NLI_GUGGENHEIMER_URL,
  READER_ATTRIBUTION_SHORT,
  SEFARIA_BARTENURA_VERSIONS_URL,
  SEFARIA_GEMARA_VERSIONS_URL,
  SEFARIA_KORBAN_HAEDAH_VERSIONS_URL,
  SEFARIA_MEFARESH_VERSIONS_URL,
  SEFARIA_MISHNAH_KINNIM_VERSIONS_URL,
  SEFARIA_RASHI_VERSIONS_URL,
  SEFARIA_SHEKALIM_VERSIONS_URL,
  SEFARIA_STEINSALTZ_SHEKALIM_VERSIONS_URL,
  SEFARIA_STEINSALTZ_VERSIONS_URL,
  SEFARIA_URL,
  SHEKALIM_ATTRIBUTION_SHORT,
  SHEKALIM_STEINSALTZ_ATTRIBUTION_SHORT,
  TORAT_EMET_RIGHTS_URL,
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

  it('uses https for Torat Emet rights', () => {
    expect(TORAT_EMET_RIGHTS_URL.startsWith('https://')).toBe(true);
  });

  it('points Sefaria chips at version pages and links Guggenheimer at NLI', () => {
    const sefariaById: Record<string, string> = {
      gemara: SEFARIA_GEMARA_VERSIONS_URL,
      steinsaltz: SEFARIA_STEINSALTZ_VERSIONS_URL,
      rashi: SEFARIA_RASHI_VERSIONS_URL,
      'tamid-commentators': SEFARIA_MEFARESH_VERSIONS_URL,
      'shekalim-text': SEFARIA_SHEKALIM_VERSIONS_URL,
      'steinsaltz-shekalim': SEFARIA_STEINSALTZ_SHEKALIM_VERSIONS_URL,
      'shekalim-yerushalmi': SEFARIA_KORBAN_HAEDAH_VERSIONS_URL,
      mishnah: SEFARIA_MISHNAH_KINNIM_VERSIONS_URL,
      bartenura: SEFARIA_BARTENURA_VERSIONS_URL,
    };

    for (const [id, url] of Object.entries(sefariaById)) {
      const entry = CONTENT_LICENSES.find((item) => item.id === id);
      expect(entry?.links.some((link) => link.label === 'ספריא' && link.url === url)).toBe(true);
      expect(url).toContain('?tab=versions');
      expect(url.startsWith(`${SEFARIA_URL}/`)).toBe(true);
    }

    const shekalimText = CONTENT_LICENSES.find((entry) => entry.id === 'shekalim-text');
    expect(
      shekalimText?.links.some(
        (link) => link.label === 'הספרייה הלאומית' && link.url === NLI_GUGGENHEIMER_URL,
      ),
    ).toBe(true);
  });
});
