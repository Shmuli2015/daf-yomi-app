import React, { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import ConfirmModal from './ConfirmModal';
import DafMarkMenuModal from './DafMarkMenuModal';
import HomeDateBar from './Home/HomeDateBar';
import HomeHeroCard from './Home/HomeHeroCard';
import { useTheme } from '../theme';
import { useHomeHeaderSwipe } from '../hooks/useHomeHeaderSwipe';
import { createHomeHeaderStyles } from './Home/HomeHeader.styles';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  eventName?: string;
  sharedSubtitle?: string;
  todayMasechet: string;
  todayDafNum: string;
  onOpenTzuratHadaf?: () => void;
  onPressMasechet?: () => void;
  onOpenQuickJump?: () => void;
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
  isFuture?: boolean;
  currentDate?: Date;
}

const HomeHeader = React.memo(function HomeHeader({
  gregorianDateStr,
  hebrewDateStr,
  eventName,
  sharedSubtitle,
  todayMasechet,
  todayDafNum,
  onOpenTzuratHadaf,
  onPressMasechet,
  onOpenQuickJump,
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
  isFuture = false,
  currentDate,
}: HomeHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeHeaderStyles(theme), [theme]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);

  const {
    panResponder,
    animatedProgressStyle,
    animatedSwipeTranslateStyle,
    animatedSwipeOpacityStyle,
    animatedTodayJumpTranslateStyle,
    animatedTodayJumpOpacityStyle,
    animatedTodayBtnStyle,
    handleTodayPress,
    handlePrevDay,
    handleNextDay,
  } = useHomeHeaderSwipe({
    onPrevDay,
    onNextDay,
    onTodayPress,
    isToday,
    currentDate,
    masechetProgressPct,
  });

  const handleOpenMarkMenu = useCallback(() => setShowMarkMenu(true), []);
  const handleOpenUnmarkConfirm = useCallback(() => setShowConfirm(true), []);
  const handleCancelConfirm = useCallback(() => setShowConfirm(false), []);
  const handleConfirmUnmark = useCallback(() => {
    setShowConfirm(false);
    handleToggle?.();
  }, [handleToggle]);
  const handleCancelMarkMenu = useCallback(() => setShowMarkMenu(false), []);
  const handleSelectFull = useCallback(() => {
    setShowMarkMenu(false);
    onMarkFull?.();
  }, [onMarkFull]);
  const handleSelectHalfA = useCallback(() => {
    setShowMarkMenu(false);
    onMarkPartialA?.();
  }, [onMarkPartialA]);
  const handleSelectHalfB = useCallback(() => {
    setShowMarkMenu(false);
    onMarkPartialB?.();
  }, [onMarkPartialB]);
  const handleUnmarkFromMenu = useCallback(() => {
    setShowMarkMenu(false);
    setShowConfirm(true);
  }, []);

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={animatedTodayJumpTranslateStyle}>
        <Animated.View style={animatedTodayJumpOpacityStyle}>
          <HomeDateBar
            hebrewDateStr={hebrewDateStr}
            gregorianDateStr={gregorianDateStr}
            eventName={eventName}
            showSecularDate={showSecularDate}
            isToday={isToday}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onTodayPress={handleTodayPress}
            animatedTodayBtnStyle={animatedTodayBtnStyle}
          />
        </Animated.View>

        <Animated.View style={animatedSwipeTranslateStyle}>
          <HomeHeroCard
            todayMasechet={todayMasechet}
            todayDafNum={todayDafNum}
            sharedSubtitle={sharedSubtitle}
            isToday={isToday}
            isFuture={isFuture}
            studyStatus={studyStatus}
            partialAmud={partialAmud}
            showHalfDafTip={showHalfDafTip}
            masechetProgressPct={masechetProgressPct}
            masechetLearnedCountLabel={masechetLearnedCountLabel}
            masechetTotalCount={masechetTotalCount}
            animatedProgressStyle={animatedProgressStyle}
            animatedContentStyle={animatedSwipeOpacityStyle}
            animatedTodayContentStyle={animatedTodayJumpOpacityStyle}
            panHandlers={panResponder.panHandlers}
            onOpenTzuratHadaf={onOpenTzuratHadaf}
            onPressMasechet={onPressMasechet}
            onOpenQuickJump={onOpenQuickJump}
            onOpenMarkMenu={handleOpenMarkMenu}
            onOpenUnmarkConfirm={handleOpenUnmarkConfirm}
            handleToggle={handleToggle}
            onMarkFull={onMarkFull}
            onDismissHalfDafTip={onDismissHalfDafTip}
          />
        </Animated.View>
      </Animated.View>

      <ConfirmModal
        visible={showConfirm}
        title="ביטול סימון דף"
        message="האם לבטל את סימון הדף כנלמד?"
        onConfirm={handleConfirmUnmark}
        onCancel={handleCancelConfirm}
      />

      <DafMarkMenuModal
        visible={showMarkMenu}
        onSelectFull={handleSelectFull}
        onSelectHalfA={handleSelectHalfA}
        onSelectHalfB={handleSelectHalfB}
        partialAmud={partialAmud}
        showUnmark={studyStatus === 'partial'}
        onUnmark={handleUnmarkFromMenu}
        onCancel={handleCancelMarkMenu}
      />
    </View>
  );
});

export default HomeHeader;
