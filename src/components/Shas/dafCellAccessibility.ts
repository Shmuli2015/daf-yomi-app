import { numberToGematria } from '../../data/shas';

interface DafCellAccessibilityParams {
  dafNum: number;
  isLearned: boolean;
  isPartial?: boolean;
  partialAmud?: 'a' | 'b' | null;
  isPersonalLearned?: boolean;
  isPersonalPartial?: boolean;
  personalPartialAmud?: 'a' | 'b' | null;
  mode?: 'dafYomi' | 'personal';
}

export function getDafCellAccessibilityLabel({
  dafNum,
  isLearned,
  isPartial = false,
  partialAmud = null,
  isPersonalLearned = false,
  isPersonalPartial = false,
  personalPartialAmud = null,
  mode = 'dafYomi',
}: DafCellAccessibilityParams): string {
  const dafLabel = `דף ${numberToGematria(dafNum)}`;
  const isBoth = isLearned && isPersonalLearned;
  const isPrimaryLearned = mode === 'personal' ? isPersonalLearned : isLearned;
  const isPrimaryPartial = mode === 'personal' ? isPersonalPartial : isPartial;
  const activeAmud = mode === 'personal' ? personalPartialAmud : partialAmud;

  if (isBoth) {
    return `${dafLabel}, נלמד בדף היומי ובמסלול אישי`;
  }

  if (isPrimaryLearned) {
    return `${dafLabel}, נלמד`;
  }

  if (isPrimaryPartial) {
    const amudText = activeAmud === 'a' ? 'עמוד א׳' : 'עמוד ב׳';
    return `${dafLabel}, נלמד חלקית ${amudText}`;
  }

  return `${dafLabel}, לא נלמד`;
}