import {
  getChapterEndDisplay,
  getChapterEventsForAmud,
  getChapterStartDisplay,
  insertChapterBoundaries,
  parseSefariaChaptersIndex,
  parseSefariaWholeRef,
  type SefariaChapter,
  type SefariaChapterEvent,
} from '../chapterBoundaries';

const BERAKHOT_CHAPTERS: SefariaChapter[] = [
  {
    n: 1,
    heTitle: 'מאימתי',
    start: { dafNum: 2, amud: 'a', line: 1 },
    end: { dafNum: 13, amud: 'a', line: 15 },
  },
  {
    n: 2,
    heTitle: 'היה קורא',
    start: { dafNum: 13, amud: 'a', line: 16 },
    end: { dafNum: 17, amud: 'b', line: 11 },
  },
  {
    n: 5,
    heTitle: 'אין עומדין',
    start: { dafNum: 30, amud: 'b', line: 14 },
    end: { dafNum: 34, amud: 'b', line: 32 },
  },
  {
    n: 6,
    heTitle: 'כיצד מברכין',
    start: { dafNum: 35, amud: 'a', line: 1 },
    end: { dafNum: 45, amud: 'a', line: 3 },
  },
  {
    n: 9,
    heTitle: 'הרואה',
    start: { dafNum: 54, amud: 'a', line: 1 },
    end: { dafNum: 64, amud: 'a', line: 15 },
  },
];

describe('parseSefariaWholeRef', () => {
  it('parses a mid-amud chapter range', () => {
    expect(parseSefariaWholeRef('Berakhot 13a:16-17b:11')).toEqual({
      start: { dafNum: 13, amud: 'a', line: 16 },
      end: { dafNum: 17, amud: 'b', line: 11 },
    });
  });

  it('parses a range that starts at the beginning of an amud', () => {
    expect(parseSefariaWholeRef('Berakhot 2a:1-13a:15')).toEqual({
      start: { dafNum: 2, amud: 'a', line: 1 },
      end: { dafNum: 13, amud: 'a', line: 15 },
    });
  });
});

describe('parseSefariaChaptersIndex', () => {
  it('reads chapter nodes from a Sefaria index payload', () => {
    const chapters = parseSefariaChaptersIndex({
      alts: {
        Chapters: {
          nodes: [
            {
              numeric_equivalent: 1,
              heTitle: 'מאימתי',
              wholeRef: 'Berakhot 2a:1-13a:15',
            },
            {
              numeric_equivalent: 2,
              heTitle: 'היה קורא',
              wholeRef: 'Berakhot 13a:16-17b:11',
            },
          ],
        },
      },
    });

    expect(chapters).toEqual([
      {
        n: 1,
        heTitle: 'מאימתי',
        start: { dafNum: 2, amud: 'a', line: 1 },
        end: { dafNum: 13, amud: 'a', line: 15 },
      },
      {
        n: 2,
        heTitle: 'היה קורא',
        start: { dafNum: 13, amud: 'a', line: 16 },
        end: { dafNum: 17, amud: 'b', line: 11 },
      },
    ]);
  });
});

describe('getChapterEventsForAmud', () => {
  it('emits end then start in the middle of an amud', () => {
    expect(getChapterEventsForAmud(BERAKHOT_CHAPTERS, 13, 'a', 37)).toEqual([
      {
        kind: 'end',
        segmentIndex: 14,
        n: 1,
        heTitle: 'מאימתי',
        isMasechetEnd: false,
        masechetHe: undefined,
      },
      {
        kind: 'start',
        segmentIndex: 15,
        n: 2,
        heTitle: 'היה קורא',
      },
    ]);
  });

  it('emits a start at the beginning of an amud', () => {
    expect(getChapterEventsForAmud(BERAKHOT_CHAPTERS, 35, 'a', 21)).toEqual([
      {
        kind: 'start',
        segmentIndex: 0,
        n: 6,
        heTitle: 'כיצד מברכין',
      },
    ]);
  });

  it('emits an end at the last segment of an amud', () => {
    expect(getChapterEventsForAmud(BERAKHOT_CHAPTERS, 34, 'b', 32)).toEqual([
      {
        kind: 'end',
        segmentIndex: 31,
        n: 5,
        heTitle: 'אין עומדין',
        isMasechetEnd: false,
        masechetHe: undefined,
      },
    ]);
  });

  it('marks the last chapter of the masechet', () => {
    expect(getChapterEventsForAmud(BERAKHOT_CHAPTERS, 64, 'a', 15, 'ברכות')).toEqual([
      {
        kind: 'end',
        segmentIndex: 14,
        n: 9,
        heTitle: 'הרואה',
        isMasechetEnd: true,
        masechetHe: 'ברכות',
      },
    ]);
  });
});

describe('insertChapterBoundaries', () => {
  const events: SefariaChapterEvent[] = [
    {
      kind: 'end',
      segmentIndex: 14,
      n: 1,
      heTitle: 'מאימתי',
    },
    {
      kind: 'start',
      segmentIndex: 15,
      n: 2,
      heTitle: 'היה קורא',
    },
  ];

  it('inserts hadaran and a new heading when the boundary segment has no commentary', () => {
    const blocks = insertChapterBoundaries(
      [
        { index: 12, item: { he: 'סוף' } },
        { index: 16, item: { he: 'התחלה' } },
      ],
      events,
    );

    expect(blocks).toEqual([
      { kind: 'paragraph', item: { he: 'סוף' } },
      { kind: 'chapterEnd', titleHe: 'מאימתי', isMasechetEnd: undefined, masechetHe: undefined },
      { kind: 'chapterStart', titleHe: 'היה קורא', chapterNumber: 2 },
      { kind: 'paragraph', item: { he: 'התחלה' } },
    ]);
  });

  it('places a start before the first matching paragraph', () => {
    const blocks = insertChapterBoundaries(
      [{ index: 0, item: { he: 'פתיחה' } }],
      [{ kind: 'start', segmentIndex: 0, n: 6, heTitle: 'כיצד מברכין' }],
    );

    expect(blocks).toEqual([
      { kind: 'chapterStart', titleHe: 'כיצד מברכין', chapterNumber: 6 },
      { kind: 'paragraph', item: { he: 'פתיחה' } },
    ]);
  });

  it('places an end after the last matching paragraph', () => {
    const blocks = insertChapterBoundaries(
      [{ index: 31, item: { he: 'סיום' } }],
      [{ kind: 'end', segmentIndex: 31, n: 5, heTitle: 'אין עומדין' }],
    );

    expect(blocks).toEqual([
      { kind: 'paragraph', item: { he: 'סיום' } },
      { kind: 'chapterEnd', titleHe: 'אין עומדין', isMasechetEnd: undefined, masechetHe: undefined },
    ]);
  });
});

describe('chapter label formatting', () => {
  it('formats a numbered start heading', () => {
    expect(getChapterStartDisplay('היה קורא', 2)).toEqual({
      heading: 'פרק ב\'',
      subtitle: 'היה קורא',
    });
  });

  it('splits a Chavruta source title', () => {
    expect(getChapterStartDisplay('פרק שני - היה קורא')).toEqual({
      heading: 'פרק שני',
      subtitle: 'היה קורא',
    });
  });

  it('keeps a hakdama title as a single heading', () => {
    expect(getChapterStartDisplay('הקדמה')).toEqual({ heading: 'הקדמה' });
    expect(getChapterStartDisplay('הקדמה למשנה הראשונה')).toEqual({
      heading: 'הקדמה למשנה הראשונה',
    });
  });

  it('formats hadaran and masechet end', () => {
    expect(getChapterEndDisplay('מאימתי')).toEqual({ heading: 'הדרן עלך פרק מאימתי' });
    expect(getChapterEndDisplay('הרואה', true, 'ברכות')).toEqual({
      heading: 'הדרן עלך פרק הרואה',
      subtitle: 'וסליקא לה מסכת ברכות',
    });
  });
});
