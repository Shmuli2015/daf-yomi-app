import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import AccordionSlideContent from '../AccordionSlideContent';
import { useGuideSectionAnimation } from './useGuideSectionAnimation';
import { createGuideGesturesCardStyles } from './GuideGesturesCard.styles';

interface GestureItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  badge: string;
  desc: string;
}

const GESTURES: GestureItem[] = [
  {
    id: 'half-daf-press',
    icon: 'hand-left-outline',
    title: 'לחיצה ארוכה על כפתור הסימון',
    badge: 'חצי דף',
    desc: 'פותחת תפריט לבחירת עמוד א׳ או עמוד ב׳ (במסך הבית, בקורא, בלוח השנה וברשת הדפים).',
  },
  {
    id: 'reader-commentary-tap',
    icon: 'book-outline',
    title: 'הקשה על קטע גמרא בקורא',
    badge: 'רש״י ותוספות',
    desc: 'פותחת או סוגרת הרחבה מוטמעת של פירושי רש״י ותוספות ישירות תחת הקטע הנבחר.',
  },
  {
    id: 'horizontal-swipe',
    icon: 'swap-horizontal-outline',
    title: 'החלקה אופקית (ימינה / שמאלה)',
    badge: 'דפדוף מהיר',
    desc: 'מעבר מהיר בין ימי הלימוד בכרטיס הבית, ובין עמודים ודפים רציפים בקורא הטקסט ובלוח השנה.',
  },
  {
    id: 'masechet-tap',
    icon: 'grid-outline',
    title: 'הקשה על שם המסכת',
    badge: 'רשת הדפים',
    desc: 'פותחת את רשת כל דפי המסכת לצפייה בהתקדמות, סימון מהיר ומעבר לכל דף.',
  },
];

export function GuideGesturesCard() {
  const theme = useTheme();
  const styles = useMemo(() => createGuideGesturesCardStyles(theme), [theme]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleExpanded}
        activeOpacity={0.7}
        style={styles.headerTouchable}
        accessibilityRole="button"
        accessibilityLabel="מחוות וקיצורי דרך מהירים"
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
          </View>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>מחוות וקיצורי דרך מהירים</Text>
            <Text style={styles.subtitle}>
              {isExpanded ? 'הקש לסגירה' : 'טיפים לשימוש נוח ומהיר באפליקציה'}
            </Text>
          </View>
        </View>
        <Animated.View style={animatedChevronStyle}>
          <Ionicons
            name="chevron-down-outline"
            size={18}
            color={theme.colors.textMuted}
          />
        </Animated.View>
      </TouchableOpacity>

      <AccordionSlideContent isExpanded={isExpanded}>
        <View style={styles.itemsContainer}>
          {GESTURES.map((item) => (
            <View key={item.id} style={styles.gestureRow}>
              <View style={styles.gestureIconBadge}>
                <Ionicons name={item.icon} size={16} color={theme.colors.accent} />
              </View>
              <View style={styles.gestureTextWrap}>
                <View style={styles.gestureTitleRow}>
                  <Text style={styles.gestureTitle}>{item.title}</Text>
                  <View style={styles.gestureBadge}>
                    <Text style={styles.gestureBadgeText}>{item.badge}</Text>
                  </View>
                </View>
                <Text style={styles.gestureDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </AccordionSlideContent>
    </View>
  );
}

export default GuideGesturesCard;
