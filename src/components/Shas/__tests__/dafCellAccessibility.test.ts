import { getDafCellAccessibilityLabel } from '../dafCellAccessibility';

describe('dafCellAccessibility', () => {
  it('returns learned label when isLearned is true', () => {
    const label = getDafCellAccessibilityLabel({
      dafNum: 2,
      isLearned: true,
    });
    expect(label).toBe("דף ב', נלמד");
  });

  it('returns not learned label when isLearned is false', () => {
    const label = getDafCellAccessibilityLabel({
      dafNum: 5,
      isLearned: false,
    });
    expect(label).toBe("דף ה', לא נלמד");
  });

  it('returns partial label for amud a', () => {
    const label = getDafCellAccessibilityLabel({
      dafNum: 10,
      isLearned: false,
      isPartial: true,
      partialAmud: 'a',
    });
    expect(label).toBe("דף י', נלמד חלקית עמוד א׳");
  });

  it('returns partial label for amud b', () => {
    const label = getDafCellAccessibilityLabel({
      dafNum: 10,
      isLearned: false,
      isPartial: true,
      partialAmud: 'b',
    });
    expect(label).toBe("דף י', נלמד חלקית עמוד ב׳");
  });

  it('returns both learned label when both dafYomi and personal are learned', () => {
    const label = getDafCellAccessibilityLabel({
      dafNum: 3,
      isLearned: true,
      isPersonalLearned: true,
    });
    expect(label).toBe("דף ג', נלמד בדף היומי ובמסלול אישי");
  });
});
