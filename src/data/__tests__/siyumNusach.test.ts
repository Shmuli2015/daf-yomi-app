import {
  SIYUM_MASECHET_PLACEHOLDER,
  SIYUM_NUSACH_SECTIONS,
  fillSiyumNusachMasechet,
  getSiyumNusachSections,
} from '../siyumNusach';

describe('siyumNusach', () => {
  it('replaces every masechet placeholder with the selected name', () => {
    const filled = fillSiyumNusachMasechet(
      `מַסֶּכֶת ${SIYUM_MASECHET_PLACEHOLDER} ושוב ${SIYUM_MASECHET_PLACEHOLDER}`,
      'ברכות',
    );
    expect(filled).toBe('מַסֶּכֶת ברכות ושוב ברכות');
    expect(filled.includes(SIYUM_MASECHET_PLACEHOLDER)).toBe(false);
  });

  it('fills four placeholders across the liturgy sections', () => {
    const placeholderCount = SIYUM_NUSACH_SECTIONS.reduce(
      (count, section) =>
        count + section.body.split(SIYUM_MASECHET_PLACEHOLDER).length - 1,
      0,
    );
    expect(placeholderCount).toBe(4);

    const sections = getSiyumNusachSections('שבת');
    const joined = sections.map((section) => section.body).join('\n');
    expect(joined.includes(SIYUM_MASECHET_PLACEHOLDER)).toBe(false);
    expect(joined.split('שבת').length - 1).toBe(4);
  });

  it('keeps the hadran triple-recitation note', () => {
    const hadran = SIYUM_NUSACH_SECTIONS.find((section) => section.id === 'hadran');
    expect(hadran?.note).toBe('נאמר שלוש פעמים');
  });
});
