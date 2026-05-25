import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmModal from './ConfirmModal';
import { useTheme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
  sefariaUrl: string;
  showSefariaLink?: boolean;
  showTzuratLink?: boolean;
  onOpenTzuratHadaf?: () => void;
  isLearned?: boolean;
  handleToggle?: () => void;
  masechetProgressPct?: number;
  masechetLearnedCount?: number;
  masechetTotalCount?: number;
  showSecularDate?: boolean;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onTodayPress?: () => void;
  isToday?: boolean;
  currentDate?: Date;
}

const HomeHeader = React.memo(function HomeHeader({
  gregorianDateStr,
  hebrewDateStr,
  todayMasechet,
  todayDafNum,
  sefariaUrl,
  showSefariaLink = true,
  showTzuratLink = true,
  onOpenTzuratHadaf,
  isLearned,
  handleToggle,
  masechetProgressPct = 0,
  masechetLearnedCount = 0,
  masechetTotalCount = 0,
  showSecularDate = true,
  onPrevDay,
  onNextDay,
  onTodayPress,
  isToday,
  currentDate,
}: HomeHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showConfirm, setShowConfirm] = useState(false);
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const todayJumpX = useSharedValue(0);
  const todayJumpOpacity = useSharedValue(1);
  const todayBtnScale = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withTiming(masechetProgressPct, { duration: 1000, easing: Easing.out(Easing.exp) });
    
    if (!isLearned) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [masechetProgressPct, isLearned]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedTodayJumpStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: todayJumpX.value }],
    opacity: todayJumpOpacity.value,
  }));

  const animatedTodayBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: todayBtnScale.value }],
  }));

  const handleTodayPress = () => {
    if (!onTodayPress) return;

    if (isToday) {
      onTodayPress();
      return;
    }

    todayBtnScale.value = withSequence(
      withTiming(0.9, { duration: 80, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewing = new Date(currentDate ?? today);
    viewing.setHours(0, 0, 0, 0);
    const slideFrom = viewing < today ? -18 : 18;

    todayJumpX.value = slideFrom;
    todayJumpOpacity.value = 0.55;
    todayJumpX.value = withSpring(0, { damping: 16, stiffness: 180 });
    todayJumpOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });

    onTodayPress();
  };

  return (
    <View style={styles.outerContainer}>
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <Animated.View style={animatedTodayJumpStyle}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.navBtn} 
            onPress={onPrevDay}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.datesContainer} onPress={handleTodayPress} activeOpacity={0.7}>
            <Text style={styles.hebrewDate}>{cleanHebrewDate}</Text>
            {showSecularDate && <Text style={styles.gregorianDate}>{gregorianDateStr}</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navBtn} 
            onPress={onNextDay}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {!isToday && (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(180)}
            style={animatedTodayBtnStyle}
          >
            <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress} activeOpacity={0.7}>
              <Text style={styles.todayButtonText}>חזור להיום</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeInUp.duration(500).delay(100).springify()} 
          style={[styles.dafCard, isLearned && { borderColor: theme.colors.success + '60', borderWidth: 2 }]}
        >

          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.cardHeader}>
            <View style={styles.dailyStudyBadge}>
              <Text style={styles.dailyStudyText}>הלימוד היומי</Text>
            </View>
            <View style={styles.dafBadgeSmall}>
              <Text style={styles.dafBadgeText}>{todayDafNum}</Text>
            </View>
          </View>

          <Text style={styles.masechetName} numberOfLines={1} adjustsFontSizeToFit>{todayMasechet}</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>
                התקדמות במסכת: {masechetLearnedCount} מתוך {masechetTotalCount} דפים
              </Text>
              <Text style={styles.progressValue}>{masechetProgressPct}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
            </View>
          </View>

          <View style={styles.actionStack}>
            <Animated.View style={[styles.mainButtonContainer, animatedButtonStyle]}>
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
                  size={20}
                  color={isLearned ? theme.colors.success : '#FFFFFF'}
                />
                <Text style={[styles.mainButtonText, isLearned ? styles.buttonTextDone : styles.buttonTextPending]}>
                  {isLearned ? 'אשריך! הדף נלמד' : 'סמן כנלמד'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {showSefariaLink && (
            <TouchableOpacity
              onPress={() => Linking.openURL(sefariaUrl)}
              style={styles.secondaryButton}
              activeOpacity={0.75}
            >
              <Ionicons name="book-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.secondaryButtonText}>ספריא</Text>
            </TouchableOpacity>
            )}

            {showTzuratLink && (
            <TouchableOpacity
              onPress={onOpenTzuratHadaf}
              style={styles.tzuratButton}
              activeOpacity={0.75}
            >
              <Ionicons name="document-text-outline" size={20} color={theme.colors.accent} />
              <Text style={styles.tzuratButtonText}>צורת הדף</Text>
            </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        </Animated.View>
      </Animated.View>

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
    </View>
  );
});

export default HomeHeader;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outerContainer: {
      position: 'relative',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    navBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    datesContainer: {
      alignItems: 'center',
    },
    hebrewDate: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '800',
    },
    gregorianDate: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    dafCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.hero,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    dailyStudyBadge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
    },
    dailyStudyText: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dafBadgeSmall: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dafBadgeText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
    },
    masechetName: {
      fontSize: 40,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: 'left',
      letterSpacing: -1,
      marginBottom: 20,
    },
    progressSection: {
      marginBottom: 24,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    progressLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    progressValue: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: '800',
    },
    progressBarBg: {
      height: 8,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 4,
    },
    actionStack: {
      gap: 12,
    },
    mainButtonContainer: {
      alignSelf: 'stretch',
    },
    mainButton: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 18,
      gap: 8,
    },
    buttonPending: {
      backgroundColor: theme.colors.accent,
    },
    buttonDone: {
      backgroundColor: theme.colors.success + '15',
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    mainButtonText: {
      fontSize: 15,
      fontWeight: '800',
    },
    buttonTextPending: {
      color: '#FFFFFF',
    },
    buttonTextDone: {
      color: theme.colors.success,
    },
    secondaryButton: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    tzuratButton: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.accent + '40',
      backgroundColor: theme.colors.accentLight,
    },
    tzuratButtonText: {
      color: theme.colors.accent,
      fontSize: 15,
      fontWeight: '800',
    },
    todayButton: {
      alignSelf: 'center',
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: -10,
      marginBottom: 10,
    },
    todayButtonText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
  });


