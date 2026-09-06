import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmModal from './ConfirmModal';
import DafMarkMenuModal from './DafMarkMenuModal';
import { useTheme } from '../theme';
import { useHomeHeaderSwipe } from '../hooks/useHomeHeaderSwipe';
import { createHomeHeaderStyles } from './Home/HomeHeader.styles';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
  sefariaUrl: string;
  showSefariaLink?: boolean;
  showTzuratLink?: boolean;
  onOpenTzuratHadaf?: () => void;
  onPressMasechet?: () => void;
  onOpenGuide?: () => void;
  studyStatus?: 'none' | 'partial' | 'learned';
  handleToggle?: () => void;
  onMarkFull?: () => void;
  onMarkPartialA?: () => void;
  onMarkPartialB?: () => void;
  partialAmud?: 'a' | 'b' | null;
  showHalfDafTip?: boolean;
  onDismissHalfDafTip?: () => void;
  masechetProgressPct?: number;
  masechetLearnedCountLabel?: string;
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
  onPressMasechet,
  studyStatus = 'none',
  handleToggle,
  onMarkFull,
  onMarkPartialA,
  onMarkPartialB,
  partialAmud = null,
  showHalfDafTip = false,
  onDismissHalfDafTip,
  masechetProgressPct = 0,
  masechetLearnedCountLabel = '0',
  masechetTotalCount = 0,
  showSecularDate = true,
  onPrevDay,
  onNextDay,
  onTodayPress,
  isToday,
  currentDate,
}: HomeHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeHeaderStyles(theme), [theme]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);
  const isLearned = studyStatus === 'learned';
  const isPartial = studyStatus === 'partial';
  const isMarked = isLearned || isPartial;
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  const {
    panResponder,
    animatedProgressStyle,
    animatedButtonStyle,
    animatedSwipeStyle,
    animatedTodayJumpStyle,
    animatedTodayBtnStyle,
    handleTodayPress,
  } = useHomeHeaderSwipe({
    onPrevDay,
    onNextDay,
    onTodayPress,
    isToday,
    currentDate,
    masechetProgressPct,
    isMarked,
  });

  return (
    <View style={styles.outerContainer}>
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

        <Animated.View style={animatedSwipeStyle} {...panResponder.panHandlers}>
          <View
            style={[
              styles.dafCard,
              isLearned && { borderColor: theme.colors.success + '60', borderWidth: 2 },
              isPartial && { borderColor: theme.colors.accent + '60', borderWidth: 2 },
            ]}
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

            <TouchableOpacity
              onPress={onPressMasechet}
              activeOpacity={0.85}
              style={styles.masechetPressable}
              disabled={!onPressMasechet}
            >
              <View style={styles.masechetRow}>
                <View style={styles.masechetContent}>
                  <Text style={styles.masechetName} numberOfLines={1} adjustsFontSizeToFit>{todayMasechet}</Text>

                  <View style={styles.masechetSubRow}>
                    <Text style={styles.dafBadgeTextMain}>{todayDafNum}</Text>
                    {onPressMasechet && (
                      <Text style={styles.masechetBrowseHint}>• כל דפי המסכת</Text>
                    )}
                  </View>
                </View>

                {onPressMasechet && (
                  <View style={styles.masechetChevron}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.accent} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  התקדמות במסכת: {masechetLearnedCountLabel} מתוך {masechetTotalCount} דפים
                </Text>
                <Text style={styles.progressValue}>{masechetProgressPct}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity
                  onPress={() => {
                    if (isLearned) {
                      setShowConfirm(true);
                    } else if (isPartial) {
                      onMarkFull?.();
                    } else {
                      handleToggle?.();
                    }
                  }}
                  onLongPress={() => {
                    if (!isLearned) {
                      setShowMarkMenu(true);
                      onDismissHalfDafTip?.();
                    }
                  }}
                  delayLongPress={400}
                  style={[
                    styles.mainButton,
                    isLearned ? styles.buttonDone : isPartial ? styles.buttonPartial : styles.buttonPending,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.mainButtonContent}>
                    <Ionicons
                      name={isLearned ? 'checkmark-circle' : isPartial ? 'ellipse' : 'checkmark-circle-outline'}
                      size={20}
                      color={isLearned ? '#FFFFFF' : isPartial ? theme.colors.accent : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.mainButtonText,
                        isLearned ? styles.buttonTextDone : isPartial ? styles.buttonTextPartial : styles.buttonTextPending,
                      ]}
                    >
                      {isLearned ? 'אשריך! הדף נלמד' : isPartial ? 'סיימתי את הדף!' : 'סמן כנלמד'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {showHalfDafTip && (
                <View style={styles.halfDafTip}>
                  <View style={styles.halfDafTipInner}>
                    <Text style={styles.halfDafTipText}>
                      <Text style={styles.halfDafTipBold}>טיפ: </Text>
                      לחיצה ארוכה על הכפתור מאפשרת סימון חצי דף (עמוד א' או עמוד ב') בנפרד.
                    </Text>
                    <TouchableOpacity
                      onPress={onDismissHalfDafTip}
                      style={styles.halfDafTipDismiss}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {showSefariaLink && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(sefariaUrl)}
                  style={styles.secondaryButton}
                  activeOpacity={0.75}
                >
                  <Ionicons name="book-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.secondaryButtonText}>ספריא</Text>
                </TouchableOpacity>
              )}

              {showTzuratLink && (
                <TouchableOpacity
                  onPress={onOpenTzuratHadaf}
                  style={styles.tzuratButton}
                  activeOpacity={0.75}
                >
                  <Ionicons name="reader-outline" size={18} color={theme.colors.accent} />
                  <Text style={styles.tzuratButtonText}>צורת הדף (PDF) וטקסט</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <ConfirmModal
        visible={showConfirm}
        title="ביטול סימון דף"
        message="האם לבטל את סימון הדף כנלמד?"
        onConfirm={() => {
          setShowConfirm(false);
          handleToggle?.();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <DafMarkMenuModal
        visible={showMarkMenu}
        onSelectFull={() => {
          setShowMarkMenu(false);
          onMarkFull?.();
        }}
        onSelectHalfA={() => {
          setShowMarkMenu(false);
          onMarkPartialA?.();
        }}
        onSelectHalfB={() => {
          setShowMarkMenu(false);
          onMarkPartialB?.();
        }}
        partialAmud={partialAmud}
        showUnmark={isPartial}
        onUnmark={() => {
          setShowMarkMenu(false);
          setShowConfirm(true);
        }}
        onCancel={() => setShowMarkMenu(false)}
      />
    </View>
  );
});

export default HomeHeader;
