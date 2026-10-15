const TOP_TOLERANCE_PX = 12;
export const RESTORE_TOP_PADDING_PX = 8;

export function findTopAnchorIndex(anchors: Map<number, number>, scrollY: number): number | null {
  if (anchors.size === 0) return null;
  const sorted = [...anchors.entries()].sort((a, b) => a[1] - b[1]);
  const [firstIndex] = sorted[0];
  let topIndex: number | null = null;
  for (const [index, y] of sorted) {
    if (y <= scrollY + TOP_TOLERANCE_PX) {
      topIndex = index;
    } else {
      break;
    }
  }
  if (topIndex === null || topIndex === firstIndex) return null;
  return topIndex;
}

export function buildReaderPositionKey(pageKey: string, mode: string): string {
  return `${pageKey}|${mode}`;
}
