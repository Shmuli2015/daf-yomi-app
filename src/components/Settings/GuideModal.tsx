import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';
import InfoModal from '../InfoModal';

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface GuideSectionData {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
}

const GUIDE_SECTIONS: GuideSectionData[] = [
  {
    id: 'home',
    icon: 'home-outline',
    title: 'מסך הבית',
    items: [
      'מעבר בין הימים מתבצע באמצעות החצים שבראש המסך. לחיצה על התאריך מאפשרת מעבר מהיר להיום. בעת צפייה ביום אחר, יופיע כפתור [[חזור להיום]].',
      'לחיצה קצרה על [[סמן כנלמד]] תסמן דף שלם. **לחיצה ארוכה** תפתח תפריט לבחירת: [[דף מלא]], [[חצי דף (א)]] או [[חצי דף (ב)]]. [[חצי דף (א)]] ו-[[חצי דף (ב)]] נשמרים בנפרד: סימון עמוד אחד בלבד יציג חצי דף; סימון העמוד השני (או בחירת [[דף מלא]]) ישלים את הדף ללימוד מלא. בתפריט, העמוד שכבר סומן יוצג עם סימון ✓. במצב של חצי דף, הכפתור יציג את הכיתוב [[סיימתי את הדף!]], ולחיצה קצרה עליו תשלים את הדף ללימוד מלא. כאשר הדף מסומן כנלמד, יופיע הכיתוב [[אשריך! הדף נלמד]]; לחיצה נוספת תבקש אישור לפני ביטול הסימון.',
      'לימוד חצי דף (עמוד א או עמוד ב) נספר כחצי יחידת התקדמות במסכת (לדוגמה: 3.5 מתוך 10 דפים). שני חצאי דף מאותו יום = דף מלא אחד.',
      'מונה רצף הלימוד (**Streak**) מציג את מספר הימים הרצופים שבהם למדת ללא הפסקה.',
      'מד ההתקדמות מציג את אחוז ההתקדמות שלך במסכת הנוכחית.',
      'לחיצה על **שם המסכת** או על **מד ההתקדמות במסכת** תפתח את רשימת כל דפי המסכת הנלמדת. עם סגירת הרשימה, תחזור אוטומטית למסך הבית.',
      '[[ספריא]]: כפתור המפנה לדף הגמרא באתר "ספריא" בדפדפן החיצוני.',
      '[[צורת הדף]]: כפתור הפותח את מסך הקריאה המובנה באפליקציה — המציג את דף הגמרא בעימוד וילנא המסורתי (PDF) או בקורא טקסט מנוקד עם מפרשים.',
      'גרף **7 הימים האחרונים**: מציג את רמת הלמידה בשבוע האחרון (עמודה גבוהה = דף מלא, עמודה בינונית = חצי דף, עמודה נמוכה = טרם נלמד).',
      'כפתור ה-[[שתף]] שבפינת כרטיס הרצף יפתח תצוגה מקדימה של תמונה מעוצבת (הכוללת את מספר ימי הרצף, התאריך העברי ושם האפליקציה). לחיצה על [[שתף תמונה]] תפתח את אפשרויות השיתוף של המכשיר. לתשומת לבך: משותפת תמונה בלבד, ללא טקסט או קישור נוסף.',
      'באנר ההתקדמות בש"ס מציג את מספר הדפים שסומנו מתוך סך דפי הש"ס כולו. לחיצה על הבאנר תפתח את מסך ההיסטוריה.',
      'באנר **מסלול אישי**: מאפשר לעקוב אחר לימוד מסכתות בקצב אישי (נפרד ממחזור הדף היומי). לחיצה על הכרטיס (או על [[בחר מסכת]]) תפתח מודל לבחירת מסכת פעילה. לחיצה על [[סמן את דף...]] בבאנר תסמן מיידית את הדף הבא בתור. לחיצה על הכרטיס תפתח את רשת דפי המסכת לסימון מפורט.',
    ],
  },
  {
    id: 'reader',
    icon: 'document-text-outline',
    title: 'צורת הדף וקורא טקסט מובנה',
    items: [
      '**מצבי צפייה (PDF / טקסט)**: בסרגל הכלים העליון ניתן לעבור בלחיצה אחת בין תצוגת צורת הדף (עימוד וילנא המסורתי ב-PDF) לבין **קורא טקסט מובנה** מבית ספריא (טקסט מנוקד ונגיש).',
      '**קריאת טקסט הגמרא מנוקד**: במצב טקסט, דף הגמרא מוצג בטקסט בעברית עם ניקוד קריא וברור ישירות בתוך האפליקציה.',
      '**חלונית מפרשים ופרשנויות**: בלחיצה על פסקת גמרא במצב טקסט, תפתח חלונית נשלפת מלמטה המציגה את פירושי רש"י, תוספות ומפרשים נוספים לאותה פסקה.',
      '**סרגל כלי קריאה**: מאפשר התאמה אישית מלאה של חווית הקריאה:\n  • **גודל גופן**: הגדלה או הקטנה של גודל הכתב באמצעות כפתורי פלוס (+) ומינוס (-) בסרגל הכלים.\n  • **ערכות נושא לקריאה**: בחירה בין מצב קריאה **בהיר**, **כהה**, או **ספיה (דף חול)** להקלה על העיניים.',
      '**סימון לימוד ישירות מהקורא**: בכותרת המסך מופיעים הכפתורים [[סמן כנלמד]] / [[סיימתי את הדף!]] / [[נלמד]] לסימון הדף הנוכחי ללא צורך ביציאה מהמסך. לחיצה קצרה מסמנת דף מלא או משלימה מחצי דף; **לחיצה ארוכה** פותחת תפריט לבחירת [[דף מלא]], [[חצי דף (א)]] או [[חצי דף (ב)]]. ניתן לסמן עמוד א ועמוד ב בנפרד.',
      '**ניווט מהיר**: רכיב הניווט שבתחתית המסך מאפשר מעבר קל בין עמודים (א / ב) באמצעות הכפתור [[עמוד קודם/הבא]], ומעבר בין דפים באמצעות הכפתור [[דף קודם/הבא]].',
      '**צורת הדף (PDF)**: תמיכה בהגדלה/הקטנה באמצעות מחוות צביטה (שתי אצבעות), סיבוב המסך (לרוחב/לאנכי), ושמירת תמונות הדף בזיכרון המטמון (Cache) לצפייה מהירה גם ללא חיבור לאינטרנט לאחר טעינה ראשונית.',
      '**טעינה ברשת**: טעינה ראשונית של דף חדש דורשת חיבור פעיל לאינטרנט. במקרים שבהם לא קיימת תמונה זמינה של צורת הדף, תתאפשר פתיחה של הדף באתר "ספריא" בדפדפן חיצוני.',
    ],
  },
  {
    id: 'calendar',
    icon: 'calendar-outline',
    title: 'מסך הלוח העברי',
    items: [
      'מעבר בין החודשים השונים מתבצע באמצעות החצים או על ידי החלקת האצבע ימינה ושמאלה על גבי הלוח.',
      'כאשר אינך צופה בחודש הנוכחי, יופיע כפתור קיצור דרך [[חזרה להיום]] למעבר מהיר.',
      'ימים שבהם סומן **דף מלא** מודגשים בצבע זהב מלא; ימים שבהם סומן **חצי דף** מודגשים בזהב בהיר וחצי-שקוף.',
      'היום הנוכחי מסומן ברקע זהוב עדין להדגשה.',
      '**מקרא** בתחתית לוח השנה מציג את משמעות הסימונים השונים: דף שנלמד, חצי דף, הלימוד היומי של היום ודף שטרם נלמד.',
      'תחת מסך ההגדרות, האפשרות [[הצג דף בלוח שנה]] תוסיף את ציון הדף היומי בכל תא בלוח (לבחירתך).',
      'לחיצה על תאריך מסוים תפתח כרטיסייה המציגה את פרטי הדף היומי, כפתורי למידה (גישה ישירה ל"ספריא" בדפדפן או למסך הקריאה וצורת הדף המובנה בהתאם להעדפותיך), ואפשרות לסמן את הדף כנלמד או לבטל את הסימון. **לחיצה ארוכה** על כפתור הסימון תפתח את תפריט חצי הדף, עם אפשרות לסמן [[עמוד א]] או [[עמוד ב]] בנפרד; סימון שני העמודים משלים את הדף.',
      'בתאריכים עתידיים ניתן לסמן את האפשרות [[למדתי מראש]] במידה והקדמת ולמדת את הדף המיועד לאותו היום.',
    ],
  },
  {
    id: 'history',
    icon: 'book-outline',
    title: 'מסך ההיסטוריה, התקדמות בש"ס',
    items: [
      'סקירה מלאה של כל 37 מסכתות הש"ס, כשהן מקובצות לפי סדרים (זרעים, מועד, נשים וכדומה). לחיצה על כותרת הסדר תפתח או תסגור את רשימת המסכתות שלו.',
      'לצד כל מסכת מופיע מד התקדמות המציג את מספר הדפים שנלמדו מתוך סך הדפים במסכת (כולל חישוב של חצאי דפים).',
      'לחיצה על מסכת תפתח תצוגה מפורטת של כל דפיה.',
      'בעת כניסה לפירוט המסכת מתוך מסך הבית, סגירת החלון תחזיר אותך אוטומטית ללשונית ה**ראשי**.',
      'בתוך תצוגת המסכת: האפשרויות [[סמן הכל]] או [[בטל הכל]] מאפשרות עדכון מהיר של כל דפי המסכת (בכפוף לאישור). לחלופין, ניתן ללחוץ על מספר דף בודד כדי לסמנו או לבטל את סימונו. דפים שנלמדו בחלקם (חצי דף — עמוד א או ב) יוצגו בעיצוב שונה; לחיצה עליהם תשדרג את הסימון לדף מלא.',
      'עם סיום מסכת שלמה, יופיע אפקט חגיגי של קונפטי!',
      'טבעת ההתקדמות המרכזית מציגה את אחוז ההתקדמות הכללי שלך בש"ס. ספירת ה-**דפים שנלמדו** משקללת גם חצאי דפים.',
      'כפתור ה-[[שתף]] שליד טבעת ההתקדמות מאפשר לשתף תמונת הישגים מעוצבת. בלחיצה עליו תיפתח תצוגה מקדימה המציגה את אחוז ההתקדמות בש"ס, מספר הדפים שנלמדו, מספר המסכתות שהושלמו ומיתוג האפליקציה.',
    ],
  },
  {
    id: 'settings',
    icon: 'settings-outline',
    title: 'מסך ההגדרות, תזכורות והתאמה אישית',
    items: [
      'מתג ה-[[תזכורת יומית]] מפעיל או מכבה את כלל התראות הלימוד. כאשר הוא כבוי, לא יישלחו תזכורות כלל.',
      'באנדרואיד 12 ומעלה: [[תזכורות מדויקות]] דורשות הרשאה נפרדת בהגדרות המכשיר ("תזמון התראות מדויק"). ללא הרשאה זו התזכורת עלולה להתעכב; לחץ על השורה **תזכורות מדויקות** כדי לפתוח את ההגדרות.',
      'כאשר התזכורות פעילות, באפשרותך לבחור ב-[[כל יום]] לקביעת שעת התראה קבועה לכל ימות השבוע, או ב-[[לפי ימים]] כדי להגדיר שעות שונות לכל יום בנפרד ולבטל את ההתראות בימים מבוקשים.',
      'מתוך התראת התזכורת במכשיר: כפתור [[✅ סיימתי את הדף!]] יסמן את הדף היומי כנלמד באופן מיידי; כפתור [[⏰ הזכר לי עוד שעה]] ידחה את התזכורת בשעה אחת.',
      '[[מדריך שימוש]]: פותח מדריך זה, המפרט את כלל האפשרויות והתכונות באפליקציה.',
      '[[בדוק עדכונים]]: מאפשר לבדוק אם קיימת גרסה חדשה של האפליקציה. במידה וקיים עדכון, ייפתח חלון הורדה ויופיע כפתור [[הורד והתקן]]. קובץ העדכון יירד ויפתח את מסך ההתקנה של מערכת ההפעלה.',
      '[[שתף קישור להורדה]]: מאפשר לשתף את קישור דף ההורדה של האפליקציה עם חברים (בוואטסאפ, בדוא"ל וכדומה).',
      '[[התראות עדכון אוטומטיות]]: כאשר מתג זה פעיל, האפליקציה תבצע בדיקת עדכונים אוטומטית בעת פתיחתה או עם חזרתה לפעולה מהרקע, ותתריע אם קיימת גרסה חדשה.',
      'במהלך ההתקנה יש ללחוץ על [[התקן]]. אם מופיעה התראה לגבי התקנה מ**מקורות לא ידועים**, יש לאשר זאת עבור "מסע דף" בהגדרות המכשיר.',
      'אם ההתקנה הישירה מתוך האפליקציה אינה מצליחה, האפשרות [[הורד בדפדפן]] תפתח את דף ההורדה בדפדפן החיצוני.',
      'בחלון העדכון, בחירה באפשרות [[מאוחר יותר]] תדחה את ההתקנה.',
      '[[מצב תצוגה]]: מאפשר לבחור בין עיצוב בהיר, כהה או סנכרון אוטומטי לפי הגדרות המכשיר.',
      '[[כפתורי לימוד]]: הגדרה להצגת כפתור **ספריא** בלבד, **צורת הדף** בלבד, או **שניהם יחד** במסך הבית ובלוח השנה.',
      '[[הצג תאריך לועזי]]: אפשרות להצגה או להסתרה של התאריך הלועזי לצד התאריך העברי.',
      '[[הצג דף בלוח שנה]]: הצגת מספר הדף היומי בתוך המשבצות של לוח השנה העברי.',
      '[[באנר מסלול אישי]]: אפשרות להצגה או להסתרה של באנר הלימוד האישי במסך הבית.',
      '[[אפקטים חגיגיים]]: הפעלה או כיבוי של אפקט הקונפטי המוצג בעת סימון דף כנלמד.',
      '[[גיבוי ושחזור]]: האפשרות [[שמור גיבוי לקובץ]] שומרת קובץ JSON לתיקייה במכשיר. האפשרות [[שתף גיבוי]] מאפשרת לשלוח את הקובץ. האפשרות [[ייבא גיבוי]] משחזרת נתונים מקובץ גיבוי קודם. בעת ייבוא: [[מזג עם הנתונים הקיימים]] ישלב את הנתונים החדשים; [[החלף הכל]] ימחק את כל הנתונים הקיימים ויחליפם בתוכן הגיבוי.',
      '[[איפוס נתונים]]: אפשרות למחיקה מוחלטת של כל נתוני הלימוד וההתקדמות במידת הצורך.',
      `משוב ויצירת קשר: ניתן לפנות אלינו בכתובת ${SUPPORT_EMAIL} או דרך כפתור **יצירת קשר** שבתחתית מסך ההגדרות.`,
    ],
  },
  {
    id: 'tips',
    icon: 'bulb-outline',
    title: 'טיפים ותכונות מיוחדות',
    items: [
      'כל נתוני ההתקדמות וההגדרות שלכם נשמרים באופן מקומי במכשיר לשמירה על פרטיות מלאה.',
      'מעקב הלימוד, לוח השנה העברי ומסך ההיסטוריה זמינים במלואם גם ללא חיבור לאינטרנט.',
      'הצגת צורת הדף דורשת חיבור לאינטרנט בטעינה הראשונית בלבד; דפים שכבר נטענו נשמרים במטמון ויהיו זמינים לצפייה גם ללא רשת.',
      'סימון חצי דף **אינו קוטע** את רצף הלימוד (Streak), אך הוא **אינו מוסיף** יום חדש למניין הרצף. ניתן לסמן [[עמוד א]] ו-[[עמוד ב]] בנפרד; רק לאחר סימון שני העמודים (או בחירת דף מלא) הדף ייחשב כנלמד במלואו.',
      'קובץ הגיבוי (בפורמט JSON) מאפשר להעביר את ההתקדמות וההגדרות שלכם בקלות בין מכשירים שונים ללא צורך בשרת ענן – המידע שלכם נשאר אצלכם.',
      'התראות הלימוד מתוזמנות מחדש באופן אוטומטי גם לאחר הפעלה מחדש (אתחול) של המכשיר.',
      'האפליקציה כוללת תמיכה מלאה ואינטגרלית בשפה העברית ובכיווניות מימין לשמאל (RTL) בכל המסכים.',
      'בעת פתיחת האפליקציה יוצג מסך פתיחה חגיגי עם ציטוט השראה אקראי על ערך לימוד התורה.',
      'שיתוף תמונות ההישגים וההתקדמות (רצף ימי לימוד או אחוז ההתקדמות בש"ס) מתבצע מתוך מסכי **הבית** ו-**ההיסטוריה** בלבד. האפשרות **שתף קישור להורדה** שבהגדרות נועדה לשיתוף קישור להתקנת האפליקציה.',
    ],
  },
];

const FAQ_CHIPS = [
  { id: 'personal', label: '📌 מסלול אישי', query: 'מסלול אישי' },
  { id: 'half', label: '⚡ חצי דף', query: 'חצי דף' },
  { id: 'reminder', label: '⏰ תזכורות', query: 'תזכורת' },
  { id: 'backup', label: '💾 גיבוי', query: 'גיבוי' },
  { id: 'reader', label: '📖 קורא טקסט', query: 'קורא' },
  { id: 'streak', label: '🔥 רצף לימוד', query: 'רצף' },
];

function GuideItemText({
  text,
  baseStyle,
  boldStyle,
  theme,
  searchQuery = '',
}: {
  text: string;
  baseStyle: object;
  boldStyle: object;
  theme: ReturnType<typeof useTheme>;
  searchQuery?: string;
}) {
  const parts = text
    .split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g)
    .filter((part) => part.length > 0);

  const q = searchQuery.trim().toLowerCase();

  const highlightStyle = {
    backgroundColor: 'rgba(201, 150, 60, 0.35)',
    color: theme.colors.accent,
    fontWeight: '900' as const,
    borderRadius: 4,
  };

  const renderPartWithHighlight = (
    str: string,
    style: object,
    partKey: string | number,
  ) => {
    if (!q) {
      return (
        <Text key={partKey} style={style}>
          {str}
        </Text>
      );
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const subParts = str.split(regex);

    if (subParts.length <= 1) {
      return (
        <Text key={partKey} style={style}>
          {str}
        </Text>
      );
    }

    return (
      <Text key={partKey} style={style}>
        {subParts.map((sub, subIdx) =>
          sub.toLowerCase() === q ? (
            <Text key={subIdx} style={[style, highlightStyle]}>
              {sub}
            </Text>
          ) : (
            sub
          ),
        )}
      </Text>
    );
  };

  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return renderPartWithHighlight(
            boldText,
            [baseStyle, boldStyle],
            index,
          );
        }
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const badgeContent = part.slice(2, -2);
          const isGold =
            badgeContent.includes('סמן') ||
            badgeContent.includes('סיימתי') ||
            badgeContent.includes('נלמד') ||
            badgeContent.includes('אשריך');
          const isPrimary =
            badgeContent.includes('ספריא') ||
            badgeContent.includes('צורת הדף') ||
            badgeContent.includes('גיבוי');

          const isMatchedByQuery =
            q.length > 0 && badgeContent.toLowerCase().includes(q);

          const badgeStyle = [
            styles.badgeInline,
            {
              backgroundColor: isMatchedByQuery
                ? 'rgba(201, 150, 60, 0.4)'
                : isGold
                ? theme.colors.accentLight
                : theme.colors.surface,
              color: isGold || isMatchedByQuery
                ? theme.colors.accent
                : isPrimary
                ? theme.colors.primary
                : theme.colors.textPrimary,
              borderColor: isMatchedByQuery
                ? theme.colors.accent
                : isGold
                ? 'rgba(201, 150, 60, 0.35)'
                : theme.colors.border,
            },
          ];

          return renderPartWithHighlight(
            ` ${badgeContent} `,
            badgeStyle,
            index,
          );
        }
        return renderPartWithHighlight(part, baseStyle, index);
      })}
    </Text>
  );
}

interface GuideSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
  theme: ReturnType<typeof useTheme>;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

const GuideSection = ({
  icon,
  title,
  items,
  theme,
  isExpanded,
  onToggle,
  searchQuery = '',
}: GuideSectionProps) => {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.sectionHeaderTouchable}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={theme.colors.accent} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCountText}>{items.length} נושאים</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.bullet} />
              <GuideItemText
                text={item}
                baseStyle={styles.itemText}
                boldStyle={styles.itemTextBold}
                theme={theme}
                searchQuery={searchQuery}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export function GuideModal({ visible, onClose }: GuideModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  // Default state: all sections expanded initially
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() =>
    GUIDE_SECTIONS.reduce((acc, sec) => {
      acc[sec.id] = true;
      return acc;
    }, {} as Record<string, boolean>),
  );

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedMap(
      GUIDE_SECTIONS.reduce((acc, sec) => {
        acc[sec.id] = true;
        return acc;
      }, {} as Record<string, boolean>),
    );
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedMap(
      GUIDE_SECTIONS.reduce((acc, sec) => {
        acc[sec.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
    );
  }, []);

  const handleChipPress = useCallback(
    (chipId: string, queryText: string) => {
      if (activeChipId === chipId) {
        setActiveChipId(null);
        setSearchQuery('');
      } else {
        setActiveChipId(chipId);
        setSearchQuery(queryText);
      }
    },
    [activeChipId],
  );

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GUIDE_SECTIONS;

    return GUIDE_SECTIONS.map((sec) => {
      const matchingItems = sec.items.filter(
        (item) =>
          item.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q),
      );
      return {
        ...sec,
        items: matchingItems,
      };
    }).filter((sec) => sec.items.length > 0);
  }, [searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
          <View style={styles.modalHandle} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>מדריך לשימוש באפליקציה</Text>
              <Text style={styles.modalSubtitle}>כל התכונות והאפשרויות במקום אחד</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>סגירה</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Input Box */}
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.textMuted}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="חפש במדריך..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (activeChipId) setActiveChipId(null);
                }}
              />
              {hasSearch && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setActiveChipId(null);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick FAQ Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScrollView}
              contentContainerStyle={styles.chipsContainer}
            >
              {FAQ_CHIPS.map((chip) => {
                const isSelected = activeChipId === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    onPress={() => handleChipPress(chip.id, chip.query)}
                    style={[
                      styles.faqChip,
                      isSelected && styles.faqChipSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.faqChipText,
                        isSelected && styles.faqChipTextSelected,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Search Results Summary */}
            {hasSearch && (
              <View style={styles.searchResultsInfo}>
                <Text style={styles.searchResultsText}>
                  נמצאו {filteredSections.reduce((acc, s) => acc + s.items.length, 0)} תוצאות עבור "{searchQuery}"
                </Text>
              </View>
            )}

            {/* Empty Search State */}
            {filteredSections.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="help-circle-outline"
                  size={48}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>לא נמצאו תוצאות</Text>
                <Text style={styles.emptySubtitle}>
                  לא מצאנו נושאים המתאימים לחיפוש "{searchQuery}". נסה לחפש במילים אחרות.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setActiveChipId(null);
                  }}
                  style={styles.clearSearchBtn}
                >
                  <Text style={styles.clearSearchBtnText}>נקה חיפוש</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Render Guide Sections */}
            {filteredSections.map((sec) => (
              <GuideSection
                key={sec.id}
                icon={sec.icon}
                title={sec.title}
                items={sec.items}
                theme={theme}
                isExpanded={hasSearch || !!expandedMap[sec.id]}
                onToggle={() => toggleSection(sec.id)}
                searchQuery={searchQuery}
              />
            ))}

            {/* Contact Box */}
            <View style={styles.contactBox}>
              <View style={styles.contactHeader}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={theme.colors.accent}
                  />
                </View>
                <Text style={styles.contactTitle}>יצירת קשר ותמיכה</Text>
              </View>
              <Text style={styles.contactIntro}>
                למשוב, תמיכה טכנית או הצעות לשיפור, ניתן ללחוץ על הכתובת הבאה לפתיחה מהירה באפליקציית הדוא"ל:
              </Text>
              <TouchableOpacity onPress={openSupportEmail} activeOpacity={0.75}>
                <Text style={styles.contactEmail} selectable>
                  {SUPPORT_EMAIL}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <GuideItemText
                text="ניתן לפתוח מדריך זה מחדש בכל עת דרך כפתור [[מדריך שימוש]] במסך ההגדרות. כמו כן, במסך ההגדרות תוכלו לבדוק אם קיימים עדכונים חדשים, להפעיל או לכבות את מתג [[התראות עדכון אוטומטיות]], ולצפות בפרטי זכויות היוצרים ובמספר הגרסה הנוכחית שבתחתית המסך."
                baseStyle={styles.footerText}
                boldStyle={styles.footerTextBold}
                theme={theme}
              />
              <Text style={styles.footerEmoji}>📚✨</Text>
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <InfoModal
        visible={mailHintVisible}
        onClose={() => setMailHintVisible(false)}
        title="אפליקציית הדוא״ל לא נפתחה"
        message="במכשירים מסוימים לא מתבצעת הפניה אוטומטית לאפליקציית הדוא״ל. באפשרותך להעתיק את הכתובת המופיעה מטה ולשלוח אלינו הודעה באופן ידני."
        emphasis={SUPPORT_EMAIL}
      />
    </>
  );
}

const styles = StyleSheet.create({
  badgeInline: {
    fontSize: 12,
    fontWeight: '800',
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    modalSafe: {
      flex: 1,
      backgroundColor: theme.colors.background,
      direction: 'rtl',
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    modalSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtnText: {
      color: theme.colors.accent,
      fontWeight: '700',
      fontSize: 13,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 16,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlign: 'start' as any,
      padding: 0,
    },
    chipsScrollView: {
      marginBottom: 14,
    },
    chipsContainer: {
      gap: 8,
      paddingHorizontal: 2,
    },
    faqChip: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    faqChipSelected: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    faqChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    faqChipTextSelected: {
      color: theme.colors.accent,
      fontWeight: '800',
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
      marginBottom: 14,
      paddingHorizontal: 4,
    },
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    controlBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    controlBtnTextMuted: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    searchResultsInfo: {
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    searchResultsText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 36,
      paddingHorizontal: 20,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    clearSearchBtn: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.accentLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accent,
    },
    clearSearchBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    sectionHeaderTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    sectionCountText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    itemsList: {
      gap: 12,
      paddingHorizontal: 14,
      paddingBottom: 16,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingRight: 4,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.accent,
      marginTop: 7,
    },
    itemText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    itemTextBold: {
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    contactBox: {
      backgroundColor: theme.colors.accentLight,
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    contactIntro: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginBottom: 10,
    },
    contactEmail: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
      marginTop: 20,
      gap: 12,
    },
    footerDivider: {
      width: 40,
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 4,
    },
    footerText: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontWeight: '600',
    },
    footerTextBold: {
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    footerEmoji: {
      fontSize: 20,
      marginTop: 4,
    },
  });
