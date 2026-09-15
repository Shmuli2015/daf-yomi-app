import {
  KINNIM_CHAPTER_MISHNAH_COUNTS,
  KINNIM_DAF_RANGES,
  MIDDOT_CHAPTER_MISHNAH_COUNTS,
  MIDDOT_DAF_RANGES,
} from '../../data/mishnahOnlyDafYomi';
import {
  buildMishnahOnlyChapterEvents,
  buildMishnahOnlySefariaTref,
  expandMishnahRange,
  getMishnahDafSlot,
  isKinnimMasechet,
  isKinnimTamidSharedAmud,
  isMidotMasechet,
  isMishnahOnlySlot,
  isTamidMasechet,
  mishnahAddressesForPage,
  mishnahLabelHe,
  parseMishnahRange,
  readerDisplayMasechetHe,
  resolveChavrutaLocation,
  spanningMishnahSplitIndex,
  dafYomiDisplayMasechetHe,
  kinnimTamidCalendarDisplay,
} from '../mishnahOnlySefaria';

describe('masechet detection', () => {
  it('recognizes Kinnim, Middot, and Tamid spellings', () => {
    expect(isKinnimMasechet('Kinnim')).toBe(true);
    expect(isKinnimMasechet('קינים')).toBe(true);
    expect(isMidotMasechet('Midot')).toBe(true);
    expect(isMidotMasechet('Middot')).toBe(true);
    expect(isMidotMasechet('מדות')).toBe(true);
    expect(isTamidMasechet('Tamid')).toBe(true);
    expect(isTamidMasechet('תמיד')).toBe(true);
    expect(isKinnimMasechet('Tamid')).toBe(false);
  });
});

describe('parseMishnahRange', () => {
  it('parses a same-chapter tail', () => {
    expect(parseMishnahRange('1.1-2')).toEqual({
      start: { chapter: 1, mishnah: 1 },
      end: { chapter: 1, mishnah: 2 },
    });
  });

  it('parses a chapter-spanning range', () => {
    expect(parseMishnahRange('4.5-5.4')).toEqual({
      start: { chapter: 4, mishnah: 5 },
      end: { chapter: 5, mishnah: 4 },
    });
  });
});

describe('buildMishnahOnlySefariaTref', () => {
  it('maps Kinnim 23a-25a onto Mishnah Kinnim ranges without overlap', () => {
    expect(KINNIM_DAF_RANGES).toHaveLength(5);
    expect(buildMishnahOnlySefariaTref('Kinnim', 23, 'a')).toBe('Mishnah_Kinnim.1.1-2');
    expect(buildMishnahOnlySefariaTref('Kinnim', 23, 'b')).toBe('Mishnah_Kinnim.1.3-4');
    expect(buildMishnahOnlySefariaTref('Kinnim', 24, 'a')).toBe('Mishnah_Kinnim.2.1-3');
    expect(buildMishnahOnlySefariaTref('Kinnim', 24, 'b')).toBe('Mishnah_Kinnim.2.4-5');
    expect(buildMishnahOnlySefariaTref('Kinnim', 25, 'a')).toBe('Mishnah_Kinnim.3.1-6');
    expect(buildMishnahOnlySefariaTref('Kinnim', 25, 'b')).toBeNull();
  });

  it('maps Middot 34a-37b onto Mishnah Middot ranges', () => {
    expect(MIDDOT_DAF_RANGES).toHaveLength(8);
    expect(buildMishnahOnlySefariaTref('Midot', 34, 'a')).toBe('Mishnah_Middot.1.1-5');
    expect(buildMishnahOnlySefariaTref('Middot', 37, 'a')).toBe('Mishnah_Middot.4.1-4');
    expect(buildMishnahOnlySefariaTref('Midot', 37, 'b')).toBe('Mishnah_Middot.4.5-5.4');
    expect(getMishnahDafSlot('Midot', 37, 'b')).toMatchObject({
      startChapter: 4,
      endChapter: 5,
      spansChapters: true,
    });
  });
});

describe('shared Tamid amud and mishnah-only slots', () => {
  it('treats Kinnim 25b and Tamid 25b as the shared Tamid amud', () => {
    expect(isKinnimTamidSharedAmud('Kinnim', 25, 'b')).toBe(true);
    expect(isKinnimTamidSharedAmud('Tamid', 25, 'b')).toBe(true);
    expect(isKinnimTamidSharedAmud('קינים', 25, 'b')).toBe(true);
    expect(isKinnimTamidSharedAmud('Kinnim', 25, 'a')).toBe(false);
    expect(isKinnimTamidSharedAmud('Tamid', 26, 'a')).toBe(false);
  });

  it('marks Kinnim 23a-25a and Middot as mishnah-only, not Kinnim 25b', () => {
    expect(isMishnahOnlySlot('Kinnim', 23, 'a')).toBe(true);
    expect(isMishnahOnlySlot('Kinnim', 25, 'a')).toBe(true);
    expect(isMishnahOnlySlot('Kinnim', 25, 'b')).toBe(false);
    expect(isMishnahOnlySlot('Midot', 34, 'a')).toBe(true);
    expect(isMishnahOnlySlot('Tamid', 25, 'b')).toBe(false);
  });

  it('resolves Chavruta and reader titles for the shared amud to Tamid', () => {
    expect(resolveChavrutaLocation('Kinnim', 25, 'b')).toEqual({
      masechetEn: 'Tamid',
      dafNum: 25,
      amud: 'b',
    });
    expect(resolveChavrutaLocation('Tamid', 25, 'b')).toEqual({
      masechetEn: 'Tamid',
      dafNum: 25,
      amud: 'b',
    });
    expect(readerDisplayMasechetHe('Kinnim', 25, 'b', 'קינים')).toBe('תמיד');
    expect(readerDisplayMasechetHe('Kinnim', 25, 'a', 'קינים')).toBe('קינים');
  });

  it('labels the Kinnim 25 calendar day as Kinnim and Tamid', () => {
    expect(kinnimTamidCalendarDisplay('קינים', 25)).toEqual({
      masechetHe: 'קינים ותמיד',
      subtitleHe: 'קינים ע״א · תמיד ע״ב',
    });
    expect(dafYomiDisplayMasechetHe('קינים', 25)).toBe('קינים ותמיד');
    expect(kinnimTamidCalendarDisplay('קינים', 24)).toBeNull();
    expect(dafYomiDisplayMasechetHe('ברכות', 2)).toBe('ברכות');
  });
});

describe('spanningMishnahSplitIndex', () => {
  it('counts strings in the first nested chapter group', () => {
    const he = [
      ['a', 'b'],
      ['c', 'd', 'e'],
    ];
    expect(spanningMishnahSplitIndex(he)).toBe(2);
  });

  it('returns null for a flat segment list', () => {
    expect(spanningMishnahSplitIndex(['a', 'b', 'c'])).toBeNull();
  });
});

describe('buildMishnahOnlyChapterEvents', () => {
  it('opens chapter 1 at the start of Kinnim 23a', () => {
    expect(buildMishnahOnlyChapterEvents('Kinnim', 23, 'a', 2, null)).toEqual([
      { kind: 'start', segmentIndex: 0, n: 1, heTitle: 'חטאת העוף' },
    ]);
  });

  it('closes chapter 1 on Kinnim 23b', () => {
    expect(buildMishnahOnlyChapterEvents('Kinnim', 23, 'b', 2, null)).toEqual([
      { kind: 'end', segmentIndex: 1, n: 1, heTitle: 'חטאת העוף' },
    ]);
  });

  it('closes the masechet on Kinnim 25a', () => {
    expect(buildMishnahOnlyChapterEvents('Kinnim', 25, 'a', 6, null)).toEqual([
      { kind: 'start', segmentIndex: 0, n: 3, heTitle: 'במה דברים אמורים' },
      {
        kind: 'end',
        segmentIndex: 5,
        n: 3,
        heTitle: 'במה דברים אמורים',
        isMasechetEnd: true,
        masechetHe: 'קינים',
      },
    ]);
  });

  it('closes chapter 4, opens chapter 5, and ends Middot on 37b', () => {
    expect(buildMishnahOnlyChapterEvents('Midot', 37, 'b', 8, 4)).toEqual([
      { kind: 'end', segmentIndex: 3, n: 4, heTitle: 'פתח ההיכל' },
      { kind: 'start', segmentIndex: 4, n: 5, heTitle: 'לשכות' },
      {
        kind: 'end',
        segmentIndex: 7,
        n: 5,
        heTitle: 'לשכות',
        isMasechetEnd: true,
        masechetHe: 'מדות',
      },
    ]);
  });
});

describe('mishnah labels', () => {
  it('expands a same-chapter range into consecutive mishnayot', () => {
    expect(expandMishnahRange('1.3-4', KINNIM_CHAPTER_MISHNAH_COUNTS)).toEqual([
      { chapter: 1, mishnah: 3 },
      { chapter: 1, mishnah: 4 },
    ]);
    expect(mishnahAddressesForPage('Kinnim', 23, 'a').map((item) => mishnahLabelHe(item.mishnah))).toEqual([
      'משנה א\'',
      'משנה ב\'',
    ]);
    expect(mishnahAddressesForPage('Kinnim', 23, 'b').map((item) => mishnahLabelHe(item.mishnah))).toEqual([
      'משנה ג\'',
      'משנה ד\'',
    ]);
  });

  it('expands a chapter-spanning Middot range through the end of chapter 4', () => {
    expect(expandMishnahRange('4.5-5.4', MIDDOT_CHAPTER_MISHNAH_COUNTS)).toEqual([
      { chapter: 4, mishnah: 5 },
      { chapter: 4, mishnah: 6 },
      { chapter: 4, mishnah: 7 },
      { chapter: 5, mishnah: 1 },
      { chapter: 5, mishnah: 2 },
      { chapter: 5, mishnah: 3 },
      { chapter: 5, mishnah: 4 },
    ]);
    expect(mishnahLabelHe(1)).toBe('משנה א\'');
    expect(mishnahLabelHe(3)).toBe('משנה ג\'');
  });
});
