import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

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
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export function GuideModal({ visible, onClose }: GuideModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
        <View style={styles.modalHandle} />

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>מדריך שימוש באפליקציה</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>סגור</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalScroll} 
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introBox}>
            <Text style={styles.introText}>
              ברוכים הבאים למסע דף! מדריך זה יעזור לכם להכיר את כל הפיצ'רים והאפשרויות באפליקציה.
            </Text>
          </View>

          <GuideSection
            icon="home-outline"
            title="מסך הבית"
            items={[
              'לחץ על «סמן כנלמד» כדי לרשום את הדף היומי כנלמד; לאחר מכן הכפתור מציג «סיימתי את הדף». לחיצה חוזרת מבקשת אישור לפני ביטול הסימון',
              'רצף הלימוד (Streak) מציג כמה ימים רצופים למדת ללא הפסקה',
              'מד ההתקדמות מראה את אחוז ההתקדמות שלך במסכת הנוכחית',
              'לחץ על קישור ספריא כדי לפתוח את הדף באתר ספריא ללימוד אונליין',
              'הווידג\'ט של 7 הימים האחרונים מציג באופן ויזואלי את הימים שבהם למדת בשבוע האחרון',
              'באנר ההתקדמות בש"ס מראה כמה דפים סומנו מתוך סך דפי הש"ס. לחיצה עליו פותחת את מסך ההיסטוריה',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="calendar-outline"
            title="מסך הלוח העברי"
            items={[
              'עבור בין חודשים באמצעות החצים; כשאינך בחודש של היום, מופיע קישור «היום» לחזרה מהירה',
              'ימים שבהם סימנת שלמדת מודגשים ברקע זהוב',
              'היום הנוכחי מודגש ברקע זהוב בהיר עם הדגשה עדינה',
              'לחץ על תאריך כדי לפתוח כרטיס עם פרטי הדף, קישור לספריא ואפשרות לסמן כנלמד או לבטל (עם אישור)',
              'בתאריך עתידי ניתן לסמן «למדתי מראש» אם כבר למדת את הדף של אותו יום',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="book-outline"
            title='מסך ההיסטוריה, התקדמות בש"ס'
            items={[
              'צפה בסקירה מלאה של כל 37 מסכתות הש"ס',
              'כל מסכת מציגה מד התקדמות המראה כמה דפים למדת מתוך הסך הכולל',
              'לחץ על כל מסכת כדי לפתוח תצוגה מפורטת של כל הדפים',
              'בתוך המסכת, לחץ על מספר דף כדי לסמן אותו כנלמד או לבטל סימון',
              'כשתסיים מסכת שלמה, תזכה בקונפטי חגיגי!',
              'טבעת ההתקדמות הכוללת מציגה את אחוז ההתקדמות שלך בכל הש"ס',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="settings-outline"
            title="מסך ההגדרות, תזכורות והתאמה אישית"
            items={[
              'הפעל תזכורת יומית שתשלח לך התראה בשעה קבועה כל יום',
              'במצב תזכורות מתקדם, תוכל להגדיר שעה שונה לכל יום בשבוע',
              'בהתראה עצמה יש שני כפתורי פעולה:',
              '  • «✅ סיימתי את הדף!» מסמן את הדף כנלמד ישירות מההתראה',
              '  • «⏰ הזכר לי עוד שעה» מתזמן תזכורת נוספת בעוד שעה',
              'בחר מצב תצוגה: בהיר, כהה, או אוטומטי לפי הגדרות המכשיר',
              'הצג או הסתר את התאריך הלועזי לצד התאריך העברי',
              'הפעל או כבה אפקטים חגיגיים (קונפטי) בעת סימון דף כנלמד',
              'אפשרות לאיפוס מלא של כל הנתונים במידת הצורך',
            ]}
            theme={theme}
          />

          <GuideSection
            icon="bulb-outline"
            title="טיפים ותכונות מיוחדות"
            items={[
              'כל הנתונים שלך נשמרים באופן מקומי על המכשיר בלבד. פרטיות מלאה!',
              'האפליקציה עובדת במלואה גם ללא חיבור לאינטרנט',
              'התראות מתוזמנות מחדש באופן אוטומטי גם לאחר אתחול המכשיר',
              'תמיכה מלאה בעברית מימין לשמאל (RTL) בכל חלקי האפליקציה',
              'כל הטקסטים והתאריכים מוצגים בעברית לחוויית משתמש אידיאלית',
            ]}
            theme={theme}
          />

          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              אפשר לפתוח מחדש את המדריך בכל עת דרך «מדריך שימוש» במסך ההגדרות; בתחתית אותו מסך מופיעות זכויות היוצרים ומספר הגרסה
            </Text>
            <Text style={styles.footerEmoji}>📚✨</Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    footerEmoji: {
      fontSize: 20,
      marginTop: 4,
    },
  });
