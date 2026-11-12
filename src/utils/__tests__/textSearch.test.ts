import {
  buildHighlightSpans,
  countHighlightMatches,
  searchInSegments,
} from '../textSearch';

describe('textSearch', () => {
  it('builds highlight spans for a Hebrew query ignoring nikud', () => {
    const result = buildHighlightSpans('אָמַר רָבָא', 'רבא');
    expect(result.some((part) => part.isMatch && part.text.includes('רָבָא'))).toBe(true);
  });

  it('returns the full text when query is empty', () => {
    const result = buildHighlightSpans('אָמַר רָבָא', '');
    expect(result).toEqual([{ text: 'אָמַר רָבָא', isMatch: false }]);
  });

  it('counts multiple occurrences inside one segment', () => {
    expect(countHighlightMatches('רב אמר ורב פפא אמר', 'רב')).toBe(2);
  });

  it('lists every occurrence as a separate match', () => {
    const segments = [
      { id: '0', text: 'אמר רבא שמע מינה' },
      { id: '1', text: 'תנו רבנן' },
      { id: '2', text: 'שמע שמעון אמר' },
    ];
    const matches = searchInSegments(segments, 'שמע');
    expect(matches).toEqual([
      { segmentId: '0', segmentIndex: 0, occurrenceIndex: 0 },
      { segmentId: '2', segmentIndex: 2, occurrenceIndex: 0 },
      { segmentId: '2', segmentIndex: 2, occurrenceIndex: 1 },
    ]);
  });
});
