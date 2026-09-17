import type { SefariaCommentaryItem } from '../services/sefariaTextApi';
import {
  CLASSIC_COMMENTATOR_KEYS,
  COMMENTATOR_TITLE_HE,
  MISHNAH_COMMENTATOR_KEYS,
  SHEKALIM_COMMENTATOR_KEYS,
  TAMID_COMMENTATOR_KEYS,
} from './sefariaCommentators';
import type { CommentaryFilterTab } from '../components/SefariaReader/CommentaryFilterChips';

export function buildCommentaryFilterTabs(
  commentaries: SefariaCommentaryItem[],
): CommentaryFilterTab[] {
  const present = new Set(commentaries.map((item) => item.commentator));
  const ordered = [
    ...CLASSIC_COMMENTATOR_KEYS,
    ...SHEKALIM_COMMENTATOR_KEYS,
    ...MISHNAH_COMMENTATOR_KEYS,
    ...TAMID_COMMENTATOR_KEYS,
  ].filter((key) => present.has(key));

  return [
    { id: 'all', label: `הכל (${commentaries.length})` },
    ...ordered.map((key) => ({ id: key, label: COMMENTATOR_TITLE_HE[key] })),
  ];
}

export function formatCommentaryBadgeLabel(commList: SefariaCommentaryItem[]): string {
  if (!commList || commList.length === 0) return '';
  const commentators = Array.from(new Set(commList.map((c) => c.titleHe))).filter(Boolean);
  if (commentators.length === 1) {
    return `פירוש ${commentators[0]}`;
  }
  return `${commentators.length} פירושים (${commentators.join(', ')})`;
}
