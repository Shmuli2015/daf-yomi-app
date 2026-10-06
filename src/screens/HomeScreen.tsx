import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import HomeHeader from '../components/HomeHeader';
import HomeContent from '../components/HomeContent';
import PersonalTrackBanner from '../components/PersonalTrackBanner';
import ScreenTopGradient from '../components/ScreenTopGradient';
import YesterdayNudge from '../components/Home/YesterdayNudge';
import HomeModals from '../components/Home/HomeModals';
import HomeConfettiOverlay from '../components/Home/HomeConfettiOverlay';
import { createHomeScreenStyles } from '../components/Home/homeScreen.styles';
import { formatProgressCount } from '../utils/dafStatus';
import { useHomeMarking } from '../hooks/useHomeMarking';
import { useHomeScreenModals } from '../hooks/useHomeScreenModals';
import { useHomeScreenData } from '../hooks/useHomeScreenData';
import { useHomeScreenActions } from '../hooks/useHomeScreenActions';
import { useTheme } from '../theme';
import type { MainTabParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeScreenStyles(theme), [theme]);

  const {
    showPersonalPickerModal,
    showPersonalDetailModal,
    showQuickJumpModal,
    detailMasechetEn,
    nudgeDismissedFor,
    guideModalConfig,
    setDetailMasechetEn,
    openPersonalPicker,
    closePersonalPicker,
    openPersonalDetail,
    closePersonalDetail,
    openQuickJump,
    closeQuickJump,
    dismissNudgeForDay,
    openHeroGuide,
    openPersonalGuide,
    closeGuide,
  } = useHomeScreenModals();

  const {
    todayMasechet,
    todayDafNum,
    todayMasechetEn,
    todayDafNumValue,
    todayAmud,
    streak,
    showSecularDate,
    personalTrackEnabled,
    isAppReady,
    dismissHalfDafTip,
    activePersonalMasechet,
    personalTrackRecords,
    setActivePersonalMasechet,
    clearActivePersonalMasechet,
    togglePersonalDafLearned,
    currentDate,
    currentDateStr,
    todayStr,
    isToday,
    isFuture,
    handlePrevDay,
    handleNextDay,
    handleTodayPress,
    studyStatus,
    showHalfDafTip,
    masechetStats,
    displayMasechetHe,
    sharedSubtitle,
    partialAmud,
    hebrewDateStr,
    gregorianDateStr,
    eventName,
    shasProgress,
    last7Days,
    showYesterdayNudge,
  } = useHomeScreenData(nudgeDismissedFor);

  const {
    handleToggle,
    handleMarkFull,
    handleMarkPartialA,
    handleMarkPartialB,
    handleMarkYesterday,
    showConfetti,
    setShowConfetti,
    showSiyumModal,
    siyumMasechet,
    closeSiyum,
  } = useHomeMarking({
    currentDate,
    isFuture,
    studyStatus,
    todayMasechet,
    todayDafNum,
    masechetLearned: masechetStats.learned,
    masechetTotal: masechetStats.total,
  });

  const {
    handleOpenTzuratHadaf,
    handleOpenPersonalTzuratHadaf,
    handleOpenMasechet,
    handleOpenYesterday,
    handlePressShas,
    handleSelectDay,
    handleDismissNudge,
    handleOpenActivePersonalDetail,
    handleSelectPersonalMasechet,
    handleOpenPersonalMasechetDetail,
    handleToggleHomeActive,
    handleQuickJumpNavigate,
    handleConfettiEnd,
  } = useHomeScreenActions({
    navigation,
    todayMasechetEn,
    todayMasechet,
    todayDafNumValue,
    todayAmud,
    partialAmud,
    activePersonalMasechet,
    detailMasechetEn,
    todayStr,
    setActivePersonalMasechet,
    clearActivePersonalMasechet,
    setDetailMasechetEn,
    openPersonalDetail,
    dismissNudgeForDay,
    setShowConfetti,
  });

  if (!isAppReady) {
    return <View style={styles.loading} />;
  }

  return (
    <View style={styles.screenOuter}>
      <ScreenTopGradient />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {showYesterdayNudge && (
            <YesterdayNudge
              onMarkYesterday={handleMarkYesterday}
              onOpenYesterday={handleOpenYesterday}
              onDismiss={handleDismissNudge}
            />
          )}

          <HomeHeader
            gregorianDateStr={gregorianDateStr}
            hebrewDateStr={hebrewDateStr}
            eventName={eventName}
            sharedSubtitle={sharedSubtitle}
            todayMasechet={displayMasechetHe}
            todayDafNum={todayDafNum}
            onOpenTzuratHadaf={handleOpenTzuratHadaf}
            onPressMasechet={handleOpenMasechet}
            onOpenQuickJump={openQuickJump}
            studyStatus={studyStatus}
            handleToggle={handleToggle}
            onMarkFull={handleMarkFull}
            onMarkPartialA={handleMarkPartialA}
            onMarkPartialB={handleMarkPartialB}
            partialAmud={partialAmud}
            showHalfDafTip={showHalfDafTip}
            onDismissHalfDafTip={dismissHalfDafTip}
            masechetProgressPct={masechetStats.pct}
            masechetLearnedCountLabel={formatProgressCount(masechetStats.learned)}
            masechetTotalCount={masechetStats.total}
            showSecularDate={showSecularDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onTodayPress={handleTodayPress}
            isToday={isToday}
            isFuture={isFuture}
            currentDate={currentDate}
            onOpenGuide={openHeroGuide}
          />

          {personalTrackEnabled && (
            <>
              <View style={{ height: 16 }} />
              <PersonalTrackBanner
                activeMasechetEn={activePersonalMasechet}
                personalTrackRecords={personalTrackRecords}
                hideMarkButton={activePersonalMasechet === todayMasechetEn}
                onSelectMasechetPress={openPersonalPicker}
                onOpenMasechetDetailPress={handleOpenActivePersonalDetail}
                onToggleDafLearned={togglePersonalDafLearned}
                onOpenTzuratHadaf={handleOpenPersonalTzuratHadaf}
                onOpenGuide={openPersonalGuide}
              />
            </>
          )}

          <View style={{ height: 16 }} />

          <HomeContent
            streak={streak}
            last7Days={last7Days}
            hebrewDateStr={hebrewDateStr}
            viewedDateStr={currentDateStr}
            shasLearnedCount={shasProgress.learnedCount}
            shasTotalPages={shasProgress.totalPages}
            shasPercentage={shasProgress.percentage}
            onPressShas={handlePressShas}
            onSelectDay={handleSelectDay}
          />
        </ScrollView>
      </SafeAreaView>

      <HomeModals
        showPersonalPickerModal={showPersonalPickerModal}
        showPersonalDetailModal={showPersonalDetailModal}
        showQuickJumpModal={showQuickJumpModal}
        showSiyumModal={showSiyumModal}
        guideVisible={guideModalConfig.visible}
        guideInitialTab={guideModalConfig.initialTab}
        guideInitialCategory={guideModalConfig.initialCategory}
        detailMasechetEn={detailMasechetEn}
        activePersonalMasechet={activePersonalMasechet}
        personalTrackRecords={personalTrackRecords}
        todayMasechetEn={todayMasechetEn}
        todayDafNumValue={todayDafNumValue}
        todayAmud={todayAmud}
        siyumMasechet={siyumMasechet}
        onSelectPersonalMasechet={handleSelectPersonalMasechet}
        onOpenPersonalMasechetDetail={handleOpenPersonalMasechetDetail}
        onClosePersonalPicker={closePersonalPicker}
        onToggleHomeActive={handleToggleHomeActive}
        onToggleDafLearned={togglePersonalDafLearned}
        onOpenPersonalTzuratHadaf={handleOpenPersonalTzuratHadaf}
        onOpenPicker={openPersonalPicker}
        onClosePersonalDetail={closePersonalDetail}
        onQuickJumpNavigate={handleQuickJumpNavigate}
        onCloseQuickJump={closeQuickJump}
        onCloseGuide={closeGuide}
        onCloseSiyum={closeSiyum}
      />

      <HomeConfettiOverlay visible={showConfetti} onAnimationEnd={handleConfettiEnd} />
    </View>
  );
}
