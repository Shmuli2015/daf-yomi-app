export function findAdjacentCommentedSegmentIndex(
  segmentCount: number,
  commentaries: Record<number, unknown[] | undefined>,
  currentIndex: number,
  direction: 1 | -1,
): number | null {
  let index = currentIndex + direction;
  while (index >= 0 && index < segmentCount) {
    if ((commentaries[index]?.length ?? 0) > 0) {
      return index;
    }
    index += direction;
  }
  return null;
}
