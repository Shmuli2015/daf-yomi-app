import type { SearchableSetting } from './settingsSearch';

export const DAILY_ITEM: SearchableSetting = {
  title: 'תזכורת יומית',
  description: 'קבל התראה בשעה היעודה',
  synonyms: ['התראה', 'תזכורת', 'נוטיפיקציה', 'רימיינדר'],
};

export const MODE_ITEM: SearchableSetting = {
  title: 'לפי ימים',
  description: 'כל יום או לפי ימים',
  synonyms: ['כל יום', 'ימים', 'לוח', 'שבת', 'שישי'],
};

export const TIME_ITEM: SearchableSetting = {
  title: 'זמן ההתראה',
  description: 'מתי תרצה ללמוד כל יום?',
  synonyms: ['שעה', 'זמן', 'בוקר'],
};

export const SOUND_ITEM: SearchableSetting = {
  title: 'צליל התראה',
  description: 'השמעת צליל עם התזכורת היומית',
  synonyms: ['סאונד', 'שקט', 'קול'],
};

export const EXACT_ITEM: SearchableSetting = {
  title: 'תזכורות מדויקות',
  synonyms: ['מדויק', 'אנדרואיד', 'אלרם'],
};

export const PERMISSION_ITEM: SearchableSetting = {
  title: 'הרשאת התראות במכשיר',
  description: 'יש לאשר התראות בהגדרות המערכת',
  synonyms: ['הרשאה', 'מערכת', 'נדחה'],
};

export const NOTIFICATIONS_SEARCH_ITEMS: SearchableSetting[] = [
  DAILY_ITEM,
  MODE_ITEM,
  TIME_ITEM,
  SOUND_ITEM,
  EXACT_ITEM,
  PERMISSION_ITEM,
];

export const THEME_ITEM: SearchableSetting = {
  title: 'מצב תצוגה',
  description: 'בחר מצב בהיר/כהה או לפי המערכת',
  synonyms: ['ערכת נושא', 'כהה', 'בהיר', 'דארק', 'לייט', 'מערכת', 'תמה'],
};

export const DAF_DAY_START_ITEM: SearchableSetting = {
  title: 'מתי מתחלף הדף היומי',
  description: 'בחצות, שעה קבועה, או לפי ימי השבוע',
  synonyms: ['חצות', 'שקיעה', 'ערב', 'החלפת דף', 'תחילת יום', 'שעה', 'שישי', 'שבת', 'ימים'],
};

export const DAF_DAY_START_TIME_ITEM: SearchableSetting = {
  title: 'שעת החלפת הדף',
  description: 'השעה (מ-14:00) שבה מתחלף הדף היומי',
  synonyms: ['שעה', 'ערב', 'החלפה', 'צהריים'],
};

export const DAF_DAY_START_WEEKLY_ITEM: SearchableSetting = {
  title: 'שעת החלפה לפי ימים',
  description: 'שעה שונה לכל יום בשבוע',
  synonyms: ['שישי', 'שבת', 'מוצאי שבת', 'ימים', 'שבוע'],
};

export const SECULAR_ITEM: SearchableSetting = {
  title: 'הצג תאריך לועזי',
  description: 'הצגת התאריך הלועזי לצד העברי',
  synonyms: ['גרגוריאני', 'לועזי', 'תאריך'],
};

export const CALENDAR_ITEM: SearchableSetting = {
  title: 'הצג דף בלוח שנה',
  description: 'הצגת מספר הדף היומי בכל תא בלוח השנה',
  synonyms: ['לוח', 'מספר דף', 'תא'],
};

export const CONFETTI_ITEM: SearchableSetting = {
  title: 'אפקטים חגיגיים',
  description: 'הצגת קונפטי בסיום לימוד דף',
  synonyms: ['קונפטי', 'חגיגה', 'אנימציה'],
};

export const TRACK_ITEM: SearchableSetting = {
  title: 'לימוד אישי',
  description: 'מעקב עצמאי אחר מסכתות. כיבוי מסתיר את המסלול בבית ובש״ס',
  synonyms: ['מסלול', 'אישי', 'באנר', 'שס'],
};

export const DISPLAY_SEARCH_ITEMS: SearchableSetting[] = [
  THEME_ITEM,
  DAF_DAY_START_ITEM,
  DAF_DAY_START_TIME_ITEM,
  DAF_DAY_START_WEEKLY_ITEM,
  SECULAR_ITEM,
  CALENDAR_ITEM,
  CONFETTI_ITEM,
  TRACK_ITEM,
];

export const READER_MODE_ITEM: SearchableSetting = {
  title: 'מצב קורא',
  description: 'גמרא, שטיינזלץ או חברותא בפתיחת הדף',
  synonyms: ['גמרא', 'שטיינזלץ', 'חברותא', 'קורא', 'טקסט', 'ברירת מחדל'],
};

export const GEMARA_NIKUD_ITEM: SearchableSetting = {
  title: 'ניקוד בגמרא',
  description: 'הטקסט של הגמרא מספריא, מנוקד או בלי ניקוד',
  synonyms: ['ניקוד', 'מנוקד', 'לא מנוקד', 'נקודות', 'ספריא'],
};

export const NOTES_ITEM: SearchableSetting = {
  title: 'הערות בחברותא',
  description: 'הצגת הערות כשקוראים במצב חברותא',
  synonyms: ['הערות', 'פירוש', 'חברותא'],
};

export const HAPTICS_ITEM: SearchableSetting = {
  title: 'רטט',
  description: 'משוב מגע במעברים ובסימון דף',
  synonyms: ['הפטיק', 'ויברציה', 'מגע'],
};

export const KEEP_SCREEN_AWAKE_ITEM: SearchableSetting = {
  title: 'מסך דלוק',
  description: 'מונע כיבוי אוטומטי בזמן קריאה',
  synonyms: ['כיבוי', 'שינה', 'keep awake', 'דולק'],
};

export const FONT_SIZE_SETTING: SearchableSetting = {
  title: 'גודל גופן בקורא',
  description: 'ברירת המחדל לטקסט הגמרא והפירושים',
  synonyms: ['פונט', 'אותיות', 'הגדל', 'הקטן', 'a+', 'a-'],
};

export const READER_THEME_ITEM: SearchableSetting = {
  title: 'ערכת קריאה',
  description: 'בהיר, ספיה (דף ישן) או כהה לקריאת הדף',
  synonyms: ['ספיה', 'רקע', 'צבע', 'קריאה', 'תצוגה', 'קלף', 'דף ישן', 'לילה', 'חושך'],
};

export const READER_SEARCH_ITEMS: SearchableSetting[] = [
  READER_MODE_ITEM,
  GEMARA_NIKUD_ITEM,
  READER_THEME_ITEM,
  NOTES_ITEM,
  HAPTICS_ITEM,
  KEEP_SCREEN_AWAKE_ITEM,
  FONT_SIZE_SETTING,
];

export const SAVE_ITEM: SearchableSetting = {
  title: 'שמור גיבוי לקובץ',
  description: 'בחר תיקייה (למשל הורדות) ושמור קובץ JSON במכשיר',
  synonyms: ['גיבוי', 'קובץ', 'json', 'שמירה'],
};

export const SHARE_BACKUP_ITEM: SearchableSetting = {
  title: 'שתף גיבוי',
  description: 'שלח את קובץ הגיבוי בוואטסאפ, דרייב או אפליקציה אחרת',
  synonyms: ['שיתוף', 'וואטסאפ', 'דרייב'],
};

export const IMPORT_ITEM: SearchableSetting = {
  title: 'ייבא גיבוי',
  description: 'שחזור נתונים מקובץ גיבוי קודם',
  synonyms: ['שחזור', 'ייבוא', 'מיזוג', 'החלפה'],
};

export const BACKUP_SEARCH_ITEMS: SearchableSetting[] = [
  SAVE_ITEM,
  SHARE_BACKUP_ITEM,
  IMPORT_ITEM,
];

export const CACHE_ITEM: SearchableSetting = {
  title: 'ניקוי קבצים שמורים',
  description: 'מחיקת טקסטים שמורים',
  synonyms: ['מטמון', 'קאש', 'אחסון', 'זיכרון'],
};

export const RESET_ITEM: SearchableSetting = {
  title: 'איפוס נתונים',
  description: 'מחיקת נתוני דף יומי, מסלול אישי או איפוס כללי',
  synonyms: ['מחיקה', 'איפוס', 'אתחול'],
};

export const DATA_SEARCH_ITEMS: SearchableSetting[] = [CACHE_ITEM, RESET_ITEM];

export const GUIDE_ITEM: SearchableSetting = {
  title: 'מדריך שימוש',
  description: 'למד כיצד להשתמש בכל התכונות והאפשרויות',
  synonyms: ['עזרה', 'הסבר', 'faq'],
};

export const SUPPORT_ITEM: SearchableSetting = {
  title: 'תמיכה ויצירת קשר',
  description: 'משוב והצעות לשיפור. לחיצה ארוכה מעתיקה את כתובת המייל',
  synonyms: ['מייל', 'דואל', 'אימייל', 'צור קשר', 'תמיכה'],
};

export const LICENSES_ITEM: SearchableSetting = {
  title: 'מקורות ורישיונות',
  description: 'טקסטים מספריא, שטיינזלץ, דיקטה וחברותא',
  synonyms: ['ספריא', 'רישיון', 'קרדיט'],
};

export const PRIVACY_POLICY_ITEM: SearchableSetting = {
  title: 'מדיניות פרטיות',
  description: 'איך האפליקציה מתייחסת לנתונים ולהרשאות',
  synonyms: ['פרטיות', 'מדיניות', 'נתונים'],
};

export const HELP_SEARCH_ITEMS: SearchableSetting[] = [
  GUIDE_ITEM,
  SUPPORT_ITEM,
  PRIVACY_POLICY_ITEM,
  LICENSES_ITEM,
];

export const AUTO_UPDATE_ITEM: SearchableSetting = {
  title: 'התראות עדכון אוטומטיות',
  description: 'בדיקה אוטומטית בפתיחה וחזרה מהרקע, עם אפשרות להורדה',
  synonyms: ['עדכון', 'אוטומטי'],
};

export const CHECK_UPDATE_ITEM: SearchableSetting = {
  title: 'בדוק עדכונים',
  description: 'מוודא אם יש גרסה חדשה לאפליקציה (כדאי מדי פעם)',
  synonyms: ['גרסה', 'עדכון'],
};

export const WHATS_NEW_ITEM: SearchableSetting = {
  title: 'מה חדש בגרסה זו',
  description: 'רשימת השינויים בגרסה המותקנת',
  synonyms: ['חדש', 'שינויים', 'רשימה'],
};

export const SHARE_APP_ITEM: SearchableSetting = {
  title: 'שתף קישור להורדה',
  description: 'שלח לחברים קישור להתקנת מסע דף',
  synonyms: ['שיתוף', 'הורדה', 'חברים'],
};

export const UPDATES_SEARCH_ITEMS: SearchableSetting[] = [
  AUTO_UPDATE_ITEM,
  CHECK_UPDATE_ITEM,
  WHATS_NEW_ITEM,
  SHARE_APP_ITEM,
];

export const TEST_ITEM: SearchableSetting = {
  title: 'שלח התראת בדיקה',
  description: 'בדוק שההתראות עובדות (תגיע בעוד 5 שניות)',
  synonyms: ['טסט', 'דיבאג'],
};

export const SCHEDULED_ITEM: SearchableSetting = {
  title: 'בדוק התראות מתוזמנות',
  synonyms: ['מתוזמן', 'רשימה'],
};

export const GITHUB_ITEM: SearchableSetting = {
  title: 'בדוק תגובת GitHub',
  description: 'מציג טאג ושם APK מהפרסום האחרון',
  synonyms: ['גיטהאב', 'apk'],
};

export const DEV_SEARCH_ITEMS: SearchableSetting[] = [TEST_ITEM, SCHEDULED_ITEM, GITHUB_ITEM];
