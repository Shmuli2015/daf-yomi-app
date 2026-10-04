import type { Ionicons } from '@expo/vector-icons';

export interface GuideGesture {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  badge: string;
  description: string;
}

export const GUIDE_GESTURES: GuideGesture[] = [
  {
    id: 'half-daf-press',
    icon: 'hand-left-outline',
    title: 'לחיצה ארוכה על סימון',
    badge: 'חצי דף',
    description:
      'פותחת תפריט לבחירת עמוד א׳ או עמוד ב׳ (במסך הבית, בקורא, בלוח השנה וברשת הדפים).',
  },
  {
    id: 'reader-commentary-tap',
    icon: 'book-outline',
    title: 'הקשה על קטע גמרא',
    badge: 'רש״י ותוספות',
    description: 'פותחת או סוגרת הרחבה מוטמעת של פירושי רש״י ותוספות ישירות תחת הקטע הנבחר.',
  },
  {
    id: 'horizontal-swipe',
    icon: 'swap-horizontal-outline',
    title: 'החלקה ימינה או שמאלה',
    badge: 'דפדוף מהיר',
    description:
      'מעבר מהיר בין ימי הלימוד בכרטיס הבית, ובין עמודים ודפים רציפים בקורא הטקסט ובלוח השנה.',
  },
  {
    id: 'masechet-tap',
    icon: 'grid-outline',
    title: 'הקשה על כרטיס מסכת',
    badge: 'רשת הדפים',
    description: 'פותחת את רשת כל דפי המסכת לצפייה בהתקדמות, סימון מהיר ומעבר לכל דף.',
  },
  {
    id: 'masechet-long-press',
    icon: 'checkmark-done-outline',
    title: 'לחיצה ארוכה על מסכת',
    badge: 'סמן הכל',
    description:
      'פותחת תפריט לסימון או ביטול של כל דפי המסכת בבת אחת, בדף יומי או במסלול אישי.',
  },
];
