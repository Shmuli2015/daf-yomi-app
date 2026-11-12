interface ReaderScrollNode {
  scrollTo?: (options: { x?: number; y?: number; animated?: boolean }) => void;
  scrollToOffset?: (options: { offset: number; animated?: boolean }) => void;
  scrollToIndex?: (options: { index: number; viewOffset?: number; animated?: boolean }) => void;
}

export function scrollReaderTo(
  node: ReaderScrollNode | null | undefined,
  y: number,
  animated: boolean,
): void {
  if (!node) {
    return;
  }
  if (typeof node.scrollToOffset === 'function') {
    node.scrollToOffset({ offset: y, animated });
    return;
  }
  node.scrollTo?.({ y, animated });
}

export function scrollReaderToIndex(
  node: ReaderScrollNode | null | undefined,
  index: number,
  viewOffset = 0,
  animated = true,
): void {
  node?.scrollToIndex?.({ index, viewOffset, animated });
}
