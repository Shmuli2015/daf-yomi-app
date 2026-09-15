import { findAdjacentCommentedSegmentIndex } from '../commentarySegments';

describe('findAdjacentCommentedSegmentIndex', () => {
  const commentaries = {
    0: [{}],
    2: [{}, {}],
    4: [{}],
  };

  it('finds the next commented segment while skipping empty ones', () => {
    expect(findAdjacentCommentedSegmentIndex(5, commentaries, 0, 1)).toBe(2);
    expect(findAdjacentCommentedSegmentIndex(5, commentaries, 2, 1)).toBe(4);
  });

  it('finds the previous commented segment while skipping empty ones', () => {
    expect(findAdjacentCommentedSegmentIndex(5, commentaries, 4, -1)).toBe(2);
    expect(findAdjacentCommentedSegmentIndex(5, commentaries, 2, -1)).toBe(0);
  });

  it('returns null at the ends', () => {
    expect(findAdjacentCommentedSegmentIndex(5, commentaries, 0, -1)).toBeNull();
    expect(findAdjacentCommentedSegmentIndex(5, commentaries, 4, 1)).toBeNull();
  });
});
