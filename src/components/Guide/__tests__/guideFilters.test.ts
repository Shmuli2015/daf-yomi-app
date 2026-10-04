import {
  countFaqItemsByCategory,
  countSectionItems,
  filterFaqItems,
  filterGuideSections,
  groupFaqItemsByCategory,
} from '../guideFilters';
import type { GuideFaqItemData } from '../guideFaqData';
import type { GuideSectionData } from '../guideData';

const MOCK_FAQS: GuideFaqItemData[] = [
  {
    id: 'faq-1',
    icon: 'book-outline',
    categoryId: 'reader',
    question: 'איך פותחים את קורא הגמרא?',
    answer: 'במסך הבית לוחצים על לימוד הדף.',
  },
  {
    id: 'faq-2',
    icon: 'time-outline',
    categoryId: 'settings',
    question: 'מתי מתחלף הדף היומי?',
    answer: 'ברירת המחדל היא בחצות.',
  },
  {
    id: 'faq-3',
    icon: 'checkmark-outline',
    categoryId: 'marking',
    question: 'איך מסמנים חצי דף?',
    answer: 'בלחיצה ארוכה על כפתור הסימון.',
  },
];

const MOCK_SECTIONS: GuideSectionData[] = [
  {
    id: 'home',
    icon: 'home-outline',
    title: 'מסך הבית',
    shortTitle: 'בית',
    subtitle: 'סימון והתקדמות',
    items: ['כפתור לימוד הדף פותח את הקורא.', 'מעבר בין הימים מתבצע בחצים.'],
  },
  {
    id: 'reader',
    icon: 'reader-outline',
    title: 'קורא הטקסט',
    shortTitle: 'קורא',
    subtitle: 'מצבי צפייה',
    items: ['בסרגל יש טאבים לגמרא ושטיינזלץ.'],
  },
];

describe('guideFilters', () => {
  describe('filterFaqItems', () => {
    it('returns all items when tokens list is empty', () => {
      expect(filterFaqItems(MOCK_FAQS, [])).toEqual(MOCK_FAQS);
    });

    it('filters items matching all tokens', () => {
      const filtered = filterFaqItems(MOCK_FAQS, ['קורא', 'פותחים']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('faq-1');
    });

    it('matches by category label', () => {
      const filtered = filterFaqItems(MOCK_FAQS, ['קורא']);
      expect(filtered.some((item) => item.id === 'faq-1')).toBe(true);
    });
  });

  describe('filterGuideSections', () => {
    it('filters section items matching search tokens', () => {
      const filtered = filterGuideSections(MOCK_SECTIONS, ['שטיינזלץ']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('reader');
      expect(filtered[0].items).toHaveLength(1);
    });
  });

  describe('countFaqItemsByCategory', () => {
    it('accurately counts items for each category', () => {
      const counts = countFaqItemsByCategory(MOCK_FAQS);
      expect(counts.reader).toBe(1);
      expect(counts.settings).toBe(1);
      expect(counts.marking).toBe(1);
      expect(counts.reminders).toBe(0);
    });
  });

  describe('groupFaqItemsByCategory', () => {
    it('creates non-empty groups sorted by fixed category order', () => {
      const groups = groupFaqItemsByCategory(MOCK_FAQS);
      expect(groups).toHaveLength(3);
      expect(groups[0].categoryId).toBe('reader');
      expect(groups[1].categoryId).toBe('marking');
      expect(groups[2].categoryId).toBe('settings');
    });
  });

  describe('countSectionItems', () => {
    it('sums total items across all sections', () => {
      expect(countSectionItems(MOCK_SECTIONS)).toBe(3);
    });
  });
});
