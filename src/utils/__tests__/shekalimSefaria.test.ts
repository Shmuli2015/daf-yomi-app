import { SHEKALIM_DAF_YOMI_RANGES } from '../../data/shekalimDafYomi';
import {
  alignCommentaryToSegments,
  buildShekalimChapterEvents,
  buildShekalimSefariaTref,
  collectCommentarySegmentGroups,
  expandYerushalmiRefAddresses,
  gemaraAddressesForPage,
  getShekalimDafSlot,
  isShekalimMasechet,
  parseYerushalmiRange,
  spanningSplitIndex,
} from '../shekalimSefaria';

describe('isShekalimMasechet', () => {
  it('recognizes Shekalim spellings', () => {
    expect(isShekalimMasechet('Shekalim')).toBe(true);
    expect(isShekalimMasechet('shekalim')).toBe(true);
    expect(isShekalimMasechet('Berachot')).toBe(false);
  });
});

describe('parseYerushalmiRange', () => {
  it('parses a same-halakha tail', () => {
    expect(parseYerushalmiRange('1:1:1-5')).toEqual({
      start: { chapter: 1, halakha: 1, segment: 1 },
      end: { chapter: 1, halakha: 1, segment: 5 },
    });
  });

  it('parses a same-chapter shorter right-hand address', () => {
    expect(parseYerushalmiRange('1:1:10-2:5')).toEqual({
      start: { chapter: 1, halakha: 1, segment: 10 },
      end: { chapter: 1, halakha: 2, segment: 5 },
    });
  });

  it('parses a chapter-spanning range', () => {
    expect(parseYerushalmiRange('1:4:9-2:1:4')).toEqual({
      start: { chapter: 1, halakha: 4, segment: 9 },
      end: { chapter: 2, halakha: 1, segment: 4 },
    });
  });

  it('parses a single address', () => {
    expect(parseYerushalmiRange('8:4:4')).toEqual({
      start: { chapter: 8, halakha: 4, segment: 4 },
      end: { chapter: 8, halakha: 4, segment: 4 },
    });
  });
});

describe('buildShekalimSefariaTref', () => {
  it('maps Daf Yomi 2a-22b onto Jerusalem Talmud Shekalim ranges', () => {
    expect(SHEKALIM_DAF_YOMI_RANGES).toHaveLength(42);
    expect(buildShekalimSefariaTref(2, 'a')).toBe(
      'Jerusalem_Talmud_Shekalim.1.1.1-5',
    );
    expect(buildShekalimSefariaTref(5, 'a')).toBe(
      'Jerusalem_Talmud_Shekalim.1.4.9-2.1.4',
    );
    expect(buildShekalimSefariaTref(22, 'b')).toBe(
      'Jerusalem_Talmud_Shekalim.8.4.4',
    );
    expect(buildShekalimSefariaTref(1, 'a')).toBeNull();
    expect(buildShekalimSefariaTref(23, 'a')).toBeNull();
  });

  it('marks mid-amud chapter spans', () => {
    expect(getShekalimDafSlot(5, 'a')).toMatchObject({
      startChapter: 1,
      endChapter: 2,
      spansChapters: true,
    });
    expect(getShekalimDafSlot(2, 'a')?.spansChapters).toBe(false);
  });
});

describe('spanningSplitIndex', () => {
  it('counts strings in the first nested chapter group', () => {
    const he = [
      [['a', 'b']],
      [['c', 'd', 'e', 'f']],
    ];
    expect(spanningSplitIndex(he)).toBe(2);
  });

  it('returns null for a flat segment list', () => {
    expect(spanningSplitIndex(['a', 'b', 'c'])).toBeNull();
  });
});

describe('buildShekalimChapterEvents', () => {
  it('opens chapter 1 at the start of 2a', () => {
    expect(buildShekalimChapterEvents(2, 'a', 5, null)).toEqual([
      { kind: 'start', segmentIndex: 0, n: 1, heTitle: 'באחד באדר' },
    ]);
  });

  it('does not repeat chapter markers on 2b', () => {
    expect(buildShekalimChapterEvents(2, 'b', 5, null)).toEqual([]);
  });

  it('closes chapter 1 and opens chapter 2 on spanning 5a', () => {
    expect(buildShekalimChapterEvents(5, 'a', 6, 2)).toEqual([
      { kind: 'end', segmentIndex: 1, n: 1, heTitle: 'באחד באדר' },
      { kind: 'start', segmentIndex: 2, n: 2, heTitle: 'מצרפין שקלים' },
    ]);
  });

  it('closes the masechet on 22b', () => {
    expect(buildShekalimChapterEvents(22, 'b', 1, null)).toEqual([
      {
        kind: 'end',
        segmentIndex: 0,
        n: 8,
        heTitle: 'כל הרוקין',
        isMasechetEnd: true,
        masechetHe: 'שקלים',
      },
    ]);
  });
});

describe('alignCommentaryToSegments', () => {
  it('zips comment groups when counts match', () => {
    const he = [
      ['א', 'ב'],
      ['ג'],
    ];
    expect(collectCommentarySegmentGroups(he)).toEqual([['א', 'ב'], ['ג']]);
    expect(alignCommentaryToSegments(he, 2, [], [])).toEqual([
      { segIdx: 0, texts: ['א', 'ב'] },
      { segIdx: 1, texts: ['ג'] },
    ]);
  });

  it('maps sparse spanning commentary onto gemara addresses', () => {
    const gemaraAddresses = gemaraAddressesForPage(6, [1, 4, 9], [2, 1, 4], [
      'Jerusalem Talmud Shekalim 1:4:9-10',
      'Jerusalem Talmud Shekalim 2:1:1-4',
    ]);
    expect(expandYerushalmiRefAddresses('Jerusalem Talmud Shekalim 1:4:9-10')).toEqual([
      { chapter: 1, halakha: 4, segment: 9 },
      { chapter: 1, halakha: 4, segment: 10 },
    ]);
    expect(gemaraAddresses).toHaveLength(6);

    const he = [[[]], [[[], [], ['רידב״ז']]]];
    const aligned = alignCommentaryToSegments(he, 6, gemaraAddresses, [
      'Chiddushei Ridbaz on Jerusalem Talmud Shekalim 2:1:1',
      'Chiddushei Ridbaz on Jerusalem Talmud Shekalim 2:1:2',
      'Chiddushei Ridbaz on Jerusalem Talmud Shekalim 2:1:3',
      'Chiddushei Ridbaz on Jerusalem Talmud Shekalim 2:1:4',
    ]);

    expect(aligned).toEqual([
      { segIdx: 2, texts: [] },
      { segIdx: 3, texts: [] },
      { segIdx: 4, texts: [] },
      { segIdx: 5, texts: ['רידב״ז'] },
    ]);
  });
});
