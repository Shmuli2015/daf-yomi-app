import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { createHomeHeroCardStyles } from './HomeHeroCard.styles';
import { formatPartialAmudLabel } from '../../utils/dafStatus';
import QuickJumpButton from '../QuickJump/QuickJumpButton';

interface HomeHeroCardProps {
  todayMasechet: string;
  todayDafNum: string;
  sharedSubtitle?: string;
  isToday?: boolean;
  isFuture?: boolean;
  studyStatus?: 'none' | 'partial' | 'learned';
  partialAmud?: 'a' | 'b' | null;
  showHalfDafTip?: boolean;
  masechetProgressPct?: number;
  masechetLearnedCountLabel?: string;
  masechetTotalCount?: number;
  animatedProgressStyle: any;
  animatedContentStyle?: any;
  animatedTodayContentStyle?: any;
  panHandlers?: any;
  onOpenTzuratHadaf?: () => void;
  onPressMasechet?: () => void;
  onOpenQuickJump?: () => void;
  onOpenMarkMenu: () => void;
  onOpenUnmarkConfirm: () => void;
  handleToggle?: () => void;
  onMarkFull?: () => void;
  onDismissHalfDafTip?: () => void;
}

const HomeHeroCard = React.memo(function HomeHeroCard({
  todayMasechet,
  todayDafNum,
  sharedSubtitle,
  isToday = true,
  isFuture = false,
  studyStatus = 'none',
  partialAmud = null,
  showHalfDafTip = false,
  masechetProgressPct = 0,
  masechetLearnedCountLabel = '0',
  masechetTotalCount = 0,
  animatedProgressStyle,
  animatedContentStyle,
  animatedTodayContentStyle,
  panHandlers,
  onOpenTzuratHadaf,
  onPressMasechet,
  onOpenQuickJump,
  onOpenMarkMenu,
  onOpenUnmarkConfirm,
  handleToggle,
  onMarkFull,
  onDismissHalfDafTip,
}: HomeHeroCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeHeroCardStyles(theme), [theme]);

  const isLearned = studyStatus === 'learned';
  const isPartial = studyStatus === 'partial';
  const canMark = !isLearned;
  const markLabel = isPartial
    ? 'סיימתי את הדף!'
    : isFuture
      ? 'למדתי מראש'
      : 'סמן כנלמד';

  const studyLabel = partialAmud === 'a' ? 'המשך לימוד (עמוד ב׳)' : 'לימוד הדף';

  const markScale = useSharedValue(1);
  const triggerMarkAnim = () => {
    markScale.value = withSequence(
      withTiming(0.93, { duration: 90, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 10, stiffness: 220 }),
    );
  };

  const animatedMarkBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markScale.value }],
  }));

  return (
    <View {...panHandlers}>
      <View
        style={[
          styles.dafCard,
          isLearned && { borderColor: theme.colors.success + '60' },
          isPartial && { borderColor: theme.colors.accent + '60' },
        ]}
      >
        <Animated.View style={animatedTodayContentStyle}>
          <Animated.View style={[styles.dafCardInner, animatedContentStyle]}>
        <LinearGradient
          colors={[theme.colors.white + '0D', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <View style={styles.dailyStudyBadge}>
            <Text style={styles.dailyStudyText}>{isToday ? 'הלימוד היומי' : 'דף יומי'}</Text>
          </View>

          {onOpenQuickJump && (
            <QuickJumpButton onPress={onOpenQuickJump} />
          )}
        </View>

        <TouchableOpacity
          onPress={onPressMasechet}
          activeOpacity={0.85}
          style={styles.masechetPressable}
          disabled={!onPressMasechet}
          accessibilityRole="button"
          accessibilityLabel={`${todayMasechet} ${todayDafNum}, כל דפי המסכת`}
        >
          <View style={styles.masechetRow}>
            <View style={styles.masechetContent}>
              <Text style={styles.masechetName} numberOfLines={1} adjustsFontSizeToFit>
                {todayMasechet}
              </Text>
              <View style={styles.masechetSubRow}>
                <View style={styles.dafBadge}>
                  <Text style={styles.dafBadgeTextMain}>{todayDafNum}</Text>
                </View>
              </View>
              {sharedSubtitle ? <Text style={styles.sharedNote}>{sharedSubtitle}</Text> : null}
            </View>

            {onPressMasechet && (
              <View style={styles.masechetChevronRow}>
                <Text style={styles.masechetBrowseAll}>כל הדפים</Text>
                <Ionicons name="chevron-back" size={14} color={theme.colors.accent} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {masechetLearnedCountLabel} מתוך {masechetTotalCount} דפים
            </Text>
            <Text style={styles.progressValue}>{masechetProgressPct}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={onOpenTzuratHadaf}
            style={styles.studyPrimaryBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={studyLabel}
          >
            <Ionicons name="reader-outline" size={20} color={theme.colors.white} />
            <Text style={styles.studyPrimaryText}>{studyLabel}</Text>
          </TouchableOpacity>

          <Animated.View style={animatedMarkBtnStyle}>
            {isLearned ? (
              <TouchableOpacity
                onPress={() => {
                  triggerMarkAnim();
                  onOpenUnmarkConfirm();
                }}
                style={styles.learnedSuccessBtn}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="הדף נלמד, לחיצה לביטול הסימון"
              >
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={styles.learnedSuccessText}>הדף נלמד (לחץ לביטול)</Text>
              </TouchableOpacity>
            ) : (
              <>
                {isPartial && (
                  <Text style={styles.partialStatusText}>
                    {formatPartialAmudLabel(partialAmud)}
                  </Text>
                )}

                {canMark && (
                  <TouchableOpacity
                    onPress={() => {
                      triggerMarkAnim();
                      if (isPartial) {
                        onMarkFull?.();
                      } else {
                        handleToggle?.();
                      }
                    }}
                    onLongPress={() => {
                      onOpenMarkMenu();
                      onDismissHalfDafTip?.();
                    }}
                    delayLongPress={400}
                    style={isPartial ? styles.markPartialBtn : styles.markSecondaryBtn}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={markLabel}
                  >
                    <Ionicons
                      name={isPartial ? 'ellipse' : 'checkmark-circle-outline'}
                      size={20}
                      color={theme.colors.accent}
                    />
                    <Text style={isPartial ? styles.markPartialText : styles.markSecondaryText}>
                      {markLabel}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>

          {!isLearned && (
            <>
              {showHalfDafTip && canMark && (
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
                      accessibilityRole="button"
                      accessibilityLabel="סגור טיפ"
                    >
                      <Ionicons name="close" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {canMark && !showHalfDafTip && (
                <TouchableOpacity
                  onPress={onOpenMarkMenu}
                  style={styles.halfDafLink}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="סימון חצי דף"
                >
                  <Text style={styles.halfDafLinkText}>סימון חצי דף</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.swipeHintRow} pointerEvents="none">
          <View style={styles.swipeHintDot} />
          <View style={styles.swipeHintActiveDot} />
          <View style={styles.swipeHintDot} />
        </View>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
});

export default HomeHeroCard;
