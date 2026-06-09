import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
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

interface GuideSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
  theme: ReturnType<typeof useTheme>;
}

function GuideItemText({
  text,
  baseStyle,
  boldStyle,
}: {
  text: string;
  baseStyle: object;
  boldStyle: object;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);

  return (
    <Text style={baseStyle}>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={index} style={[baseStyle, boldStyle]}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

const GuideSection = ({ icon, title, items, theme }: GuideSectionProps) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={theme.colors.accent} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.bullet} />
            <GuideItemText
              text={item}
              baseStyle={styles.itemText}
              boldStyle={styles.itemTextBold}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export function GuideModal({ visible, onClose }: GuideModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mailHintVisible, setMailHintVisible] = useState(false);

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

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

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>מדריך לשימוש באפליקציה</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>סגירה</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalScroll} 
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introBox}>
            <Text style={styles.introText}>
              ברוכים הבאים ל"מסע דף"! מדריך זה יסייע לכם להכיר את מגוון התכונות והאפשרויות באפליקציה.
            </Text>
          </View>

          <GuideSection
            icon="home-outline"
            title="מסך הבית"
            items={[
              'מעבר בין הימים מתבצע באמצעות החצים שבראש המסך. לחיצה על התאריך מאפשרת מעבר מהיר להיום. בעת צפייה ביום אחר, יופיע כפתור **חזור להיום**.',
              'לחיצה קצרה על **סמן כנלמד** תסמן דף שלם. **לחיצה ארוכה** תפתח תפריט לבחירת: **דף מלא**, **חצי דף (א)** או **חצי דף (ב)**. במצב של חצי דף, הכפתור יציג את הכיתוב **סיימתי את הדף!**, ולחיצה קצרה עליו תשלים את הדף ללימוד מלא. כאשר הדף מסומן כנלמד, יופיע הכיתוב **אשריך! הדף נלמד**; לחיצה נוספת תבקש אישור לפני ביטול הסימון.',
              'לימוד חצי דף נספר כחצי יחידת התקדמות במסכת (לדוגמה: 3.5 מתוך 10 דפים).',
              'מונה רצף הלימוד (Streak) מציג את מספר הימים הרצופים שבהם למדת ללא הפסקה.',
              'מד ההתקדמות מציג את אחוז ההתקדמות שלך במסכת הנוכחית.',
              'לחיצה על **שם המסכת** או על **מד ההתקדמות במסכת** תפתח את רשימת כל דפי המסכת הנלמדת. עם סגירת הרשימה, תחזור אוטומטית למסך הבית.',
              '**ספריא**: כפתור המפנה לדף הגמרא באתר "ספריא" בדפדפן החיצוני.',
              '**צורת הדף**: כפתור המציג את דף הגמרא בעיצוב המסורתי (עימוד וילנא) ישירות בתוך האפליקציה.',
              'גרף **7 הימים האחרונים**: מציג את רמת הלמידה בשבוע האחרון (עמודה גבוהה = דף מלא, עמודה בינונית = חצי דף, עמודה נמוכה = טרם נלמד).',
              'כפתור ה-**שתף** שבפינת כרטיס הרצף יפתח תצוגה מקדימה של תמונה מעוצבת (הכוללת את מספר ימי הרצף, התאריך העברי ושם האפליקציה). לחיצה על **שתף תמונה** תפתח את אפשרויות השיתוף של המכשיר (לשליחה בוואטסאפ, לשמירה בגלריה וכדומה). לתשומת לבך: משותפת תמונה בלבד, ללא טקסט או קישור נוסף.',
              'באנר ההתקדמות בש"ס מציג את מספר הדפים שסומנו מתוך סך דפי הש"ס כולו. לחיצה על הבאנר תפתח את מסך ההיסטוריה.',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="document-text-outline"
            title="צורת הדף: קריאה בתוך האפליקציה"
            items={[
              'הצגת דף הגמרא בעימוד וילנא המסורתי.',
              'בכותרת המסך מופיעים הכפתורים **סמן כנלמד** / **סיימתי את הדף!** / **נלמד** לסימון הדף הנוכחי ללא צורך ביציאה מהמסך. לחיצה קצרה מסמנת דף מלא או משלימה מחצי דף; **לחיצה ארוכה** פותחת תפריט לבחירת חצי דף (א/ב). במצב חצי דף ניתן לבטל את הסימון דרך התפריט; ביטול סימון של דף מלא יבקש אישור תחילה.',
              'רכיב הניווט שבתחתית המסך מאפשר מעבר בין עמודים (א ↔ ב) באמצעות הכפתור **עמוד קודם/הבא**, ומעבר בין דפים באמצעות הכפתור **דף קודם/הבא**.',
              'ניתן להגדיל או להקטין את הדף באמצעות מחוות צביטה (שתי אצבעות) על גבי המסך.',
              'מתחת לדף מופיעים הכפתורים **סובב לרוחב** ו-**סובב לאנכי**, המאפשרים התאמה של כיוון המסך לקריאה נוחה יותר.',
              'דף שנטען פעם אחת יישמר בזיכרון המטמון של המכשיר, ויאפשר גישה מהירה במיוחד גם ללא חיבור פעיל לאינטרנט.',
              'טעינה ראשונית של דף חדש דורשת חיבור פעיל לאינטרנט.',
              'במקרים שבהם לא קיימת תמונה זמינה של צורת הדף, תתאפשר פתיחה של הדף באתר "ספריא" באמצעות דפדפן חיצוני.',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="calendar-outline"
            title="מסך הלוח העברי"
            items={[
              'מעבר בין החודשים השונים מתבצע באמצעות החצים או על ידי החלקת האצבע ימינה ושמאלה על גבי הלוח.',
              'כאשר אינך צופה בחודש הנוכחי, יופיע כפתור קיצור דרך **חזרה להיום** למעבר מהיר.',
              'ימים שבהם סומן **דף מלא** מודגשים בצבע זהב מלא; ימים שבהם סומן **חצי דף** מודגשים בזהב בהיר וחצי-שקוף.',
              'היום הנוכחי מסומן ברקע זהוב עדין להדגשה.',
              '**מקרא** בתחתית לוח השנה מציג את משמעות הסימונים השונים: דף שנלמד, חצי דף, הלימוד היומי של היום ודף שטרם נלמד.',
              'תחת מסך ההגדרות, האפשרות **הצג דף בלוח שנה** תוסיף את ציון הדף היומי בכל תא בלוח (לבחירתך).',
              'לחיצה על תאריך מסוים תפתח כרטיסייה המציגה את פרטי הדף היומי, כפתורי למידה (גישה ישירה ל"ספריא" או ל"צורת הדף" בהתאם להעדפותיך), ואפשרות לסמן את הדף כנלמד או לבטל את הסימון (בכפוף לאישור). **לחיצה ארוכה** על כפתור הסימון תפתח את תפריט חצי הדף.',
              'בתאריכים עתידיים ניתן לסמן את האפשרות **למדתי מראש** במידה והקדמת ולמדת את הדף המיועד לאותו היום.',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="book-outline"
            title='מסך ההיסטוריה, התקדמות בש"ס'
            items={[
              'סקירה מלאה של כל 37 מסכתות הש"ס, כשהן מקובצות לפי סדרים (זרעים, מועד, נשים וכדומה). לחיצה על כותרת הסדר תפתח או תסגור את רשימת המסכתות שלו.',
              'לצד כל מסכת מופיע מד התקדמות המציג את מספר הדפים שנלמדו מתוך סך הדפים במסכת (כולל חישוב של חצאי דפים).',
              'לחיצה על מסכת תפתח תצוגה מפורטת של כל דפיה.',
              'בעת כניסה לפירוט המסכת מתוך מסך הבית, סגירת החלון תחזיר אותך אוטומטית ללשונית ה**ראשי**.',
              'בתוך תצוגת המסכת: האפשרויות **סמן הכל** או **בטל הכל** מאפשרות עדכון מהיר של כל דפי המסכת (בכפוף לאישור). לחלופין, ניתן ללחוץ על מספר דף בודד כדי לסמנו או לבטל את סימונו. דפים שנלמדו בחלקם (חצי דף) יוצגו בעיצוב שונה; לחיצה עליהם תשדרג את הסימון לדף מלא. לתשומת לבך: סימון ראשוני של חצי דף זמין רק ממסך הבית, מלוח השנה ומצורת הדף.',
              'עם סיום מסכת שלמה, יופיע אפקט חגיגי של קונפטי!',
              'טבעת ההתקדמות המרכזית מציגה את אחוז ההתקדמות הכללי שלך בש"ס. ספירת ה-**דפים שנלמדו** משקללת גם חצאי דפים (לדוגמה: 150.5 דפים).',
              'כפתור ה-**שתף** שליד טבעת ההתקדמות מאפשר לשתף תמונת הישגים מעוצבת. בלחיצה עליו תיפתח תצוגה מקדימה המציגה את אחוז ההתקדמות בש"ס, מספר הדפים שנלמדו, מספר המסכתות שהושלמו ומיתוג האפליקציה. לחיצה על **שתף תמונה** תפתח את אפשרויות השיתוף של המכשיר.',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="settings-outline"
            title="מסך ההגדרות, תזכורות והתאמה אישית"
            items={[
              'מתג ה-**תזכורת יומית** מפעיל או מכבה את כלל התראות הלימוד. כאשר הוא כבוי, לא יישלחו תזכורות כלל.',
              'באנדרואיד 12 ומעלה: **תזכורות מדויקות** דורשות הרשאה נפרדת בהגדרות המכשיר («תזמון התראות מדויק»). ללא הרשאה זו התזכורת עלולה להתעכב; לחץ על השורה **תזכורות מדויקות** כדי לפתוח את ההגדרות.',
              'כאשר התזכורות פעילות, באפשרותך לבחור ב-**כל יום** לקביעת שעת התראה קבועה לכל ימות השבוע, או ב-**לפי ימים** כדי להגדיר שעות שונות לכל יום בנפרד ולבטל את ההתראות בימים מבוקשים.',
              'מתוך התראת התזכורת במכשיר: כפתור **✅ סיימתי את הדף!** יסמן את הדף היומי כנלמד באופן מיידי; כפתור **⏰ הזכר לי עוד שעה** ידחה את התזכורת בשעה אחת.',
              '**מדריך שימוש**: פותח מדריך זה, המפרט את כלל האפשרויות והתכונות באפליקציה.',
              '**בדוק עדכונים**: מאפשר לבדוק אם קיימת גרסה חדשה של האפליקציה. במידה וקיים עדכון, ייפתח חלון הורדה ויופיע כפתור **הורד והתקן**. קובץ העדכון יורד ויפתח את מסך ההתקנה של מערכת ההפעלה.',
              '**שתף קישור להורדה**: מאפשר לשתף את קישור דף ההורדה של האפליקציה עם חברים (בוואטסאפ, בדוא"ל וכדומה).',
              '**התראות עדכון אוטומטיות**: כאשר מתג זה פעיל, האפליקציה תבצע בדיקת עדכונים אוטומטית בעת פתיחתה או עם חזרתה לפעולה מהרקע, ותתריע אם קיימת גרסה חדשה. כברירת מחדל אפשרות זו כבויה, וניתן לבדוק ידנית באמצעות כפתור **בדוק עדכונים**.',
              'במהלך ההתקנה יש ללחוץ על **התקן**. אם מופיעה התרעה לגבי התקנה מ**מקורות לא ידועים**, יש לאשר זאת עבור "מסע דף" בהגדרות המכשיר (האפליקציה תכוון אותך למסך המתאים).',
              'אם ההתקנה הישירה מתוך האפליקציה אינה מצליחה, האפשרות **הורד בדפדפן** תפתח את דף ההורדה בדפדפן החיצוני (כתובת האתר לשיתוף: shmuli2015.github.io/daf-yomi-app).',
              'בחלון העדכון, בחירה באפשרות **אחר כך** תדחה את ההתקנה. התראה אוטומטית עבור אותה הגרסה לא תופיע שוב עד לפרסום גרסה חדשה יותר, אך תמיד תוכל לעדכן ידנית דרך כפתור **בדוק עדכונים** שבהגדרות.',
              '**מצב תצוגה**: מאפשר לבחור בין עיצוב בהיר, כהה או סנכרון אוטומטי לפי הגדרות המכשיר.',
              '**כפתורי לימוד**: הגדרה להצגת כפתור **ספריא** בלבד, **צורת הדף** בלבד, או **שניהם יחד** במסך הבית ובלוח השנה.',
              '**הצג תאריך לועזי**: אפשרות להצגה או להסתרה של התאריך הלועזי לצד התאריך העברי.',
              '**הצג דף בלוח שנה**: הצגת מספר הדף היומי בתוך המשבצות של לוח השנה העברי.',
              '**אפקטים חגיגיים**: הפעלה או כיבוי של אפקט הקונפטי המוצג בעת סימון דף כנלמד.',
              '**גיבוי ושחזור**: האפשרות **שמור גיבוי לקובץ** שומרת קובץ JSON לתיקייה במכשיר. האפשרות **שתף גיבוי** מאפשרת לשלוח את הקובץ (בוואטסאפ, לגוגל דרייב וכדומה). האפשרות **ייבא גיבוי** משחזרת נתונים מקובץ גיבוי קודם. בעת ייבוא: **מזג עם הנתונים הקיימים** ישלב את הנתונים החדשים וישמור לכל תאריך את הרשומה המעודכנת ביותר; **החלף הכל** ימחק את כל הנתונים הקיימים ויחליפם בתוכן הגיבוי. מומלץ לבצע גיבוי לפני איפוס האפליקציה או מעבר למכשיר חדש.',
              '**איפוס נתונים**: אפשרות למחיקה מוחלטת של כל נתוני הלימוד וההתקדמות במידת הצורך.',
              `משוב ויצירת קשר: ניתן לפנות אלינו בכתובת ${SUPPORT_EMAIL} או דרך כפתור **יצירת קשר** שבתחתית מסך ההגדרות.`,
            ]}
            theme={theme}
          />

          <GuideSection
            icon="bulb-outline"
            title="טיפים ותכונות מיוחדות"
            items={[
              'כל נתוני ההתקדמות וההגדרות שלכם נשמרים באופן מקומי במכשיר לשמירה על פרטיות מלאה.',
              'מעקב הלימוד, לוח השנה העברי ומסך ההיסטוריה זמינים במלואם גם ללא חיבור לאינטרנט.',
              'הצגת צורת הדף דורשת חיבור לאינטרנט בטעינה הראשונית בלבד; דפים שכבר נטענו נשמרים במטמון ויהיו זמינים לצפייה גם ללא רשת.',
              'סימון חצי דף **אינו קוטע** את רצף הלימוד (Streak), אך הוא **אינו מוסיף** יום חדש למניין הרצף.',
              'קובץ הגיבוי (בפורמט JSON) מאפשר להעביר את ההתקדמות וההגדרות שלכם בקלות בין מכשירים שונים ללא צורך בשרת ענן – המידע שלכם נשאר אצלכם.',
              'התראות הלימוד מתוזמנות מחדש באופן אוטומטי גם לאחר הפעלה מחדש (אתחול) של המכשיר.',
              'האפליקציה כוללת תמיכה מלאה ואינטגרלית בשפה העברית ובכיווניות מימין לשמאל (RTL) בכל המסכים.',
              'בעת פתיחת האפליקציה יוצג מסך פתיחה חגיגי עם ציטוט השראה אקראי על ערך לימוד התורה.',
              'שיתוף תמונות ההתקשרות וההתקדמות (רצף ימי לימוד או אחוז ההתקדמות בש"ס) מתבצע מתוך מסכי **הבית** ו-**ההיסטוריה** בלבד. האפשרות **שתף קישור להורדה** שבהגדרות נועדה לשיתוף קישור להתקנת האפליקציה, ואינה כוללת את תמונת ההישגים האישיים.',
            ]}
            theme={theme}
          />

          <View style={styles.contactBox}>
            <View style={styles.contactHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="mail-outline" size={22} color={theme.colors.accent} />
              </View>
              <Text style={styles.sectionTitle}>יצירת קשר ותמיכה</Text>
            </View>
            <Text style={styles.contactIntro}>
              למשוב, תמיכה טכנית או הצעות לשיפור, ניתן ללחוץ על הכתובת הבאה לפתיחה מהירה באפליקציית הדוא"ל במכשירכם:
            </Text>
            <TouchableOpacity onPress={openSupportEmail} activeOpacity={0.75}>
              <Text style={styles.contactEmail} selectable>
                {SUPPORT_EMAIL}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>

            <View style={styles.footerDivider} />
            <GuideItemText
              text="ניתן לפתוח מדריך זה מחדש בכל עת דרך כפתור **מדריך שימוש** במסך ההגדרות. כמו כן, במסך ההגדרות תוכלו לבדוק אם קיימים עדכונים חדשים, להפעיל או לכבות את מתג **התראות עדכון אוטומטיות**, ולצפות בפרטי זכויות היוצרים ובמספר הגרסה הנוכחית שבתחתית המסך."
              baseStyle={styles.footerText}
              boldStyle={styles.footerTextBold}
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

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    modalSafe: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    closeBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtnText: {
      color: theme.colors.accent,
      fontWeight: '700',
      fontSize: 14,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 20,
    },
    introBox: {
      backgroundColor: theme.colors.accentLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    introText: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontWeight: '600',
    },
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.primary,
      flex: 1,
    },
    itemsList: {
      gap: 12,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingRight: 8,
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
      lineHeight: 21,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    itemTextBold: {
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    footer: {
      alignItems: 'center',
      marginTop: 32,
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
    contactBox: {
      backgroundColor: theme.colors.accentLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.3)',
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    contactIntro: {
      fontSize: 14,
      lineHeight: 21,
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
  });
