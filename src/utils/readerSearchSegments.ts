import type { ChavrutaPageData } from '../services/chavrutaApi';
import type { SefariaPageData } from '../services/sefariaTextApi';
import type { ViewMode } from '../components/SefariaReader/ReaderToolbar';
import { collectCommentariesWithIndex } from './sefariaCommentators';
import type { SearchableSegment } from './textSearch';
import {
  plainChavrutaSearchText,
  plainClassicSearchText,
  plainSteinsaltzSearchText,
} from './readerSearchText';

export function buildReaderSearchSegments(
  viewMode: ViewMode,
  sefariaData: SefariaPageData | null,
  chavrutaData: ChavrutaPageData | null,
): SearchableSegment[] {
  if (viewMode === 'classic') {
    return (sefariaData?.segments ?? []).map((segment) => ({
      id: String(segment.index),
      text: plainClassicSearchText(segment.he),
    }));
  }

  if (viewMode === 'steinsaltz') {
    if (!sefariaData) return [];
    return collectCommentariesWithIndex(sefariaData.commentaries, 'steinsaltz').map(
      ({ item }) => ({
        id: item.ref,
        text: plainSteinsaltzSearchText(item.he),
      }),
    );
  }

  const blocks =
    chavrutaData?.blocks && chavrutaData.blocks.length > 0
      ? chavrutaData.blocks
      : (chavrutaData?.paragraphs ?? []).map((paragraph) => ({
          kind: 'paragraph' as const,
          ...paragraph,
        }));

  const segments: SearchableSegment[] = [];
  blocks.forEach((block, index) => {
    if (block.kind === 'paragraph') {
      segments.push({
        id: `p-${index}`,
        text: plainChavrutaSearchText(block.text),
      });
    }
  });
  return segments;
}
