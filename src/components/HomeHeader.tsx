import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from './ConfirmModal';
import { THEME } from '../theme';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
  sefariaUrl: string;
  isLearned?: boolean;
  handleToggle?: () => void;
  masechetProgressPct?: number;
}

export default function HomeHeader({
  gregorianDateStr,
  hebrewDateStr,
  todayMasechet,
  todayDafNum,
  sefariaUrl,
  isLearned,
  handleToggle,
  masechetProgressPct = 0
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showConfirm, setShowConfirm] = useState(false);
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(-24)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(heroTranslateY, { toValue: 0, duration: 450, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 100, delay: 200, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroTranslateY }], paddingTop: insets.top + 24 }}>
      <View style={styles.datesContainer}>
        <Text style={styles.hebrewDate}>{cleanHebrewDate}</Text>
        <Text style={styles.gregorianDate}>{gregorianDateStr}</Text>
      </View>

      <Animated.View style={[styles.dafCard, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
        <View style={styles.cardHeader}>
          <View style={styles.dailyStudyBadge}>
            <Text style={styles.dailyStudyText}>הלימוד היומי</Text>
          </View>
          <View style={styles.dafBadgeSmall}>
            <Text style={styles.dafBadgeText}>{todayDafNum}</Text>
          </View>
        </View>

        <Text style={styles.masechetName}>{todayMasechet}</Text>

        <View style={styles.progressSection}>
          <Text style={styles.progressText}>{masechetProgressPct}% מהמסכת</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${masechetProgressPct}%` }]} />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (isLearned) {
              setShowConfirm(true);
            } else {
              handleToggle?.();
            }
          }}
          style={[styles.mainButton, isLearned ? styles.buttonDone : styles.buttonPending]}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={isLearned ? THEME.colors.textPrimary : 'white'} />
          <Text style={[styles.mainButtonText, isLearned ? styles.buttonTextDone : styles.buttonTextPending]}>
            {isLearned ? 'סיימתי את הדף' : 'סמן כנלמד'}
          </Text>
        </TouchableOpacity>

        <ConfirmModal
          visible={showConfirm}
          title="ביטול לימוד"
          message="האם אתה בטוח שברצונך לבטל את סימון הדף כנלמד?"
          onConfirm={() => {
            setShowConfirm(false);
            handleToggle?.();
          }}
          onCancel={() => setShowConfirm(false)}
        />

        <TouchableOpacity
          onPress={() => Linking.openURL(sefariaUrl)}
          style={styles.sefariaButton}
          activeOpacity={0.75}
        >
          <Ionicons name="open-outline" size={18} color={THEME.colors.textPrimary} />
          <Text style={styles.sefariaText}>למד בספריא</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  leftNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  datesContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hebrewDate: {
    color: THEME.colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  gregorianDate: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  dafCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dafBadgeSmall: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  dafBadgeText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  dailyStudyBadge: {
    backgroundColor: 'rgba(29, 78, 216, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dailyStudyText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  masechetName: {
    fontSize: 36,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    textAlign: 'left',
    letterSpacing: -1,
    marginBottom: 24,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: THEME.colors.border,
    borderRadius: 2,
    flexDirection: 'row',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  buttonPending: {
    backgroundColor: THEME.colors.success,
  },
  buttonDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.success,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  buttonTextPending: {
    color: 'white',
  },
  buttonTextDone: {
    color: THEME.colors.textPrimary,
  },
  sefariaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  sefariaText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
