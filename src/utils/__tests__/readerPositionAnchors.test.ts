import { buildReaderPositionKey, findTopAnchorIndex } from '../readerPositionAnchors';

describe('readerPositionAnchors', () => {
  const anchors = new Map<number, number>([
    [0, 80],
    [1, 300],
    [2, 700],
    [3, 1200],
  ]);

  it('returns null when there are no anchors', () => {
    expect(findTopAnchorIndex(new Map(), 500)).toBeNull();
  });

  it('returns null at the top of the page', () => {
    expect(findTopAnchorIndex(anchors, 0)).toBeNull();
    expect(findTopAnchorIndex(anchors, 90)).toBeNull();
  });

  it('returns the last anchor that has reached the top of the viewport', () => {
    expect(findTopAnchorIndex(anchors, 310)).toBe(1);
    expect(findTopAnchorIndex(anchors, 699)).toBe(2);
    expect(findTopAnchorIndex(anchors, 5000)).toBe(3);
  });

  it('builds a stable key per page and mode', () => {
    expect(buildReaderPositionKey('Berachot-5-a', 'chavruta')).toBe('Berachot-5-a|chavruta');
  });
});
