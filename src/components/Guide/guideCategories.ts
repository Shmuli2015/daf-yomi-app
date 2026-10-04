import type { Ionicons } from '@expo/vector-icons';

export type GuideCategoryId =
  | 'reader'
  | 'marking'
  | 'navigation'
  | 'progress'
  | 'reminders'
  | 'settings';

export interface GuideCategory {
  id: GuideCategoryId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface GuidePopularTopic {
  id: string;
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  categoryId: GuideCategoryId;
  faqId: string;
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { id: 'reader', label: 'קורא הטקסט', icon: 'reader-outline' },
  { id: 'marking', label: 'סימון ומסלול אישי', icon: 'checkmark-done-outline' },
  { id: 'navigation', label: 'ניווט ולוח שנה', icon: 'calendar-outline' },
  { id: 'progress', label: 'רצף והישגים', icon: 'flame-outline' },
  { id: 'reminders', label: 'תזכורות', icon: 'notifications-outline' },
  { id: 'settings', label: 'הגדרות וגיבוי', icon: 'settings-outline' },
];

export const GUIDE_POPULAR_TOPICS: GuidePopularTopic[] = [
  {
    id: 'half-daf',
    label: 'חצי דף',
    hint: 'סימון עמוד א׳ או ב׳',
    icon: 'remove-circle-outline',
    categoryId: 'marking',
    faqId: 'half-page',
  },
  {
    id: 'reader-modes',
    label: 'מצבי הקורא',
    hint: 'גמרא, שטיינזלץ, חברותא',
    icon: 'reader-outline',
    categoryId: 'reader',
    faqId: 'reader-modes',
  },
  {
    id: 'catchup',
    label: 'השלמת פערים',
    hint: 'דפים שנשכחו החודש',
    icon: 'flash-outline',
    categoryId: 'navigation',
    faqId: 'catchup-pages',
  },
  {
    id: 'backup',
    label: 'גיבוי והעברה',
    hint: 'מעבר למכשיר חדש',
    icon: 'cloud-upload-outline',
    categoryId: 'settings',
    faqId: 'backup-restore',
  },
];

const CATEGORY_BY_ID = new Map(GUIDE_CATEGORIES.map((category) => [category.id, category]));

export function getGuideCategory(id: GuideCategoryId): GuideCategory {
  const category = CATEGORY_BY_ID.get(id);
  if (!category) {
    throw new Error(`Unknown guide category: ${id}`);
  }
  return category;
}
