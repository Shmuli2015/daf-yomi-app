import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from './ConfirmModal';
import { useTheme } from '../theme';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
  sefariaUrl: string;
  isLearned?: boolean;
  handleToggle?: () => void;
  masechetProgressPct?: number;
  showSecularDate?: boolean;
}

const HomeHeader = React.memo(function HomeHeader({
  gregorianDateStr,
  hebrewDateStr,
  todayMasechet,
  todayDafNum,
  sefariaUrl,
  isLearned,
  handleToggle,
  masechetProgressPct = 0,
  showSecularDate = true
}: HomeHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        {showSecularDate && <Text style={styles.gregorianDate}>{gregorianDateStr}</Text>}
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
          <Ionicons
            name={isLearned ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={isLearned ? theme.colors.accent : '#FFFFFF'}
          />
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
          <Ionicons name="open-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.sefariaText}>למד בספריא</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

export default HomeHeader;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    datesContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    hebrewDate: {
      color: theme.colors.accent,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    gregorianDate: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    dafCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dafBadgeText: {
      color: theme.colors.textPrimary,
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
      color: theme.colors.textPrimary,
      textAlign: 'left',
      letterSpacing: -1,
      marginBottom: 24,
    },
    progressSection: {
      marginBottom: 24,
    },
    progressText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      textAlign: 'left',
      marginBottom: 8,
      fontWeight: '600',
    },
    progressBarBg: {
      height: 4,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 2,
      flexDirection: 'row',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
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
      backgroundColor: theme.colors.accent,
    },
    buttonDone: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    mainButtonText: {
      fontSize: 16,
      fontWeight: '800',
    },
    buttonTextPending: {
      color: '#FFFFFF',
    },
    buttonTextDone: {
      color: theme.colors.textPrimary,
    },
    sefariaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    sefariaText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
