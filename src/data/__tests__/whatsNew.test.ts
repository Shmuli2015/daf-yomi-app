import {
  APP_NOTES_END_MARKER,
  formatWhatsNewReleaseBodyFrom,
  getHighlightsFromEntries,
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
    version: '1.1.1',
    highlights: ['  ', 'נקודה אחת'],
  },
];

describe('whatsNew', () => {
  it('returns highlights for a matching version and skips blanks', () => {
    expect(getHighlightsFromEntries(sampleEntries, 'v1.1.1')).toEqual(['נקודה אחת']);
    expect(getHighlightsFromEntries(sampleEntries, '9.9.9')).toEqual([]);
  });

  it('shows after-install notes only when the installed version changed and has highlights', () => {
    expect(shouldShowWhatsNewOnLaunch(null, '1.2.0', sampleEntries)).toBe(false);
    expect(shouldShowWhatsNewOnLaunch('1.2.0', '1.2.0', sampleEntries)).toBe(false);
    expect(shouldShowWhatsNewOnLaunch('1.1.1', '1.2.0', sampleEntries)).toBe(true);
    expect(shouldShowWhatsNewOnLaunch('1.0.0', '1.0.1', sampleEntries)).toBe(false);
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
