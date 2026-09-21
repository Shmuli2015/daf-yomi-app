import {
  APP_NOTES_END_MARKER,
  filterReleaseHighlightsForUpdateFromEntries,
  formatWhatsNewReleaseBodyFrom,
  getAllReleaseHighlightsFromEntries,
  getHighlightsFromEntries,
  getHighlightsSinceFromEntries,
  getKnownHighlightsUpToVersionFromEntries,
  parseReleaseNotesBody,
  shouldShowWhatsNewOnLaunch,
  type WhatsNewEntry,
} from '../whatsNew';

const sampleEntries: WhatsNewEntry[] = [
  {
    version: '1.2.0',
    highlights: ['תיקון סימון חצי דף', 'שיפור יציבות בהורדת עדכונים'],
  },
  {
    version: '1.1.2',
    highlights: ['חלון מה חדש אחרי ההתקנה'],
  },
  {
    version: '1.1.1',
    highlights: ['  ', 'נקודה אחת'],
  },
];

describe('whatsNew', () => {
  it('returns highlights for a matching version and skips blanks', () => {
    expect(getHighlightsFromEntries(sampleEntries, 'v1.1.1')).toEqual(['נקודה אחת']);
    expect(getHighlightsFromEntries(sampleEntries, '9.9.9')).toEqual([]);
  });

  it('shows after-install notes when this version has highlights and was not dismissed yet', () => {
    expect(shouldShowWhatsNewOnLaunch(null, '1.2.0', sampleEntries)).toBe(true);
    expect(shouldShowWhatsNewOnLaunch('1.2.0', '1.2.0', sampleEntries)).toBe(false);
    expect(shouldShowWhatsNewOnLaunch('1.1.1', '1.2.0', sampleEntries)).toBe(true);
    expect(shouldShowWhatsNewOnLaunch(null, '1.0.1', sampleEntries)).toBe(false);
    expect(shouldShowWhatsNewOnLaunch('1.0.0', '1.0.1', sampleEntries)).toBe(false);
  });

  it('merges skipped versions after an upgrade, but only the current version on first install', () => {
    expect(getHighlightsSinceFromEntries(sampleEntries, '1.1.1', '1.2.0')).toEqual([
      'תיקון סימון חצי דף',
      'שיפור יציבות בהורדת עדכונים',
      'חלון מה חדש אחרי ההתקנה',
    ]);
    expect(getHighlightsSinceFromEntries(sampleEntries, null, '1.2.0')).toEqual([
      'תיקון סימון חצי דף',
      'שיפור יציבות בהורדת עדכונים',
    ]);
    expect(getHighlightsSinceFromEntries(sampleEntries, '1.2.0', '1.2.0')).toEqual([]);
    expect(getAllReleaseHighlightsFromEntries(sampleEntries)).toEqual([
      'תיקון סימון חצי דף',
      'שיפור יציבות בהורדת עדכונים',
      'חלון מה חדש אחרי ההתקנה',
      'נקודה אחת',
    ]);
  });

  it('collects local highlights already known up to the installed version', () => {
    expect(getKnownHighlightsUpToVersionFromEntries(sampleEntries, '1.1.1')).toEqual(['נקודה אחת']);
    expect(getKnownHighlightsUpToVersionFromEntries(sampleEntries, '1.1.2')).toEqual([
      'חלון מה חדש אחרי ההתקנה',
      'נקודה אחת',
    ]);
  });

  it('filters merged release notes down to only bullets newer than installed', () => {
    const remote = getAllReleaseHighlightsFromEntries(sampleEntries);
    expect(filterReleaseHighlightsForUpdateFromEntries(remote, sampleEntries, '1.1.1')).toEqual([
      'תיקון סימון חצי דף',
      'שיפור יציבות בהורדת עדכונים',
      'חלון מה חדש אחרי ההתקנה',
    ]);
    expect(filterReleaseHighlightsForUpdateFromEntries(remote, sampleEntries, '1.2.0')).toEqual([]);
  });

  it('keeps remote-only bullets that are not in local WHATS_NEW', () => {
    expect(
      filterReleaseHighlightsForUpdateFromEntries(
        ['תיקון סימון חצי דף', 'שיפור מהשרת בלבד'],
        sampleEntries,
        '1.1.2',
      ),
    ).toEqual(['תיקון סימון חצי דף', 'שיפור מהשרת בלבד']);
  });

  it('formats a GitHub body that the parser can read back', () => {
    const body = formatWhatsNewReleaseBodyFrom(['תיקון א', 'תיקון ב']);
    expect(body).toContain('## מה חדש');
    expect(body).toContain(`- תיקון א`);
    expect(body).toContain(APP_NOTES_END_MARKER);
    expect(parseReleaseNotesBody(body)).toEqual(['תיקון א', 'תיקון ב']);
  });

  it('stops before auto-generated GitHub notes and ignores headings', () => {
    const body = [
      '## מה חדש',
      '- שיפור חיפוש בהגדרות',
      '- **תיקון** מסך הבית',
      '',
      APP_NOTES_END_MARKER,
      '',
      '## What\'s Changed',
      '* Build Android APK by @bot in https://github.com/x/y/pull/12',
      '**Full Changelog**: https://github.com/x/y/compare/v1.1.0...v1.1.1',
    ].join('\n');
    expect(parseReleaseNotesBody(body)).toEqual(['שיפור חיפוש בהגדרות', 'תיקון מסך הבית']);
  });

  it('ignores GitHub auto-generated notes when the app marker is missing', () => {
    const body = [
      '## What\'s Changed',
      '* Build Android APK by @bot',
      '**Full Changelog**: https://github.com/x/y/compare/v1.1.0...v1.1.1',
    ].join('\n');
    expect(parseReleaseNotesBody(body)).toEqual([]);
  });

  it('returns an empty list when the body is missing', () => {
    expect(parseReleaseNotesBody(null)).toEqual([]);
    expect(parseReleaseNotesBody('')).toEqual([]);
    expect(formatWhatsNewReleaseBodyFrom([])).toBe(`${APP_NOTES_END_MARKER}\n`);
  });
});
