import React, { useMemo, useCallback, useState } from "react";
import { ScrollView, View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { HDate } from "@hebcal/core";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";
import ConfettiCannon from "react-native-confetti-cannon";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import HomeHeader from "../components/HomeHeader";
import HomeContent from "../components/HomeContent";
import PersonalTrackBanner from "../components/PersonalTrackBanner";
import PersonalMasechetPickerModal from "../components/PersonalMasechetPickerModal";
import PersonalMasechetDetailModal from "../components/PersonalMasechetDetailModal";
import QuickJumpModal from "../components/QuickJump/QuickJumpModal";
import SiyumModal from "../components/Siyum/SiyumModal";
import GuideModal from "../components/Settings/GuideModal";
import ScreenTopGradient from "../components/ScreenTopGradient";
import YesterdayNudge from "../components/Home/YesterdayNudge";
import { useAppStore } from "../store/useAppStore";
import { getDafDayDate, getDafDayYesterday } from "../utils/dafDayBoundary";
import { buildLast7Days, buildRecentHistoryKey } from "../utils/last7Days";
import { dafYomiDisplayMasechetHe, kinnimTamidCalendarDisplay } from "../utils/mishnahOnlySefaria";
import { SHAS_MASECHTOT } from "../data/shas";
import { getMasechetDafim } from "../utils/shas";
import { getStudyStatus, formatProgressCount, getPartialAmud } from "../utils/dafStatus";
import { getMasechetProgressFromCache } from "../utils/progressCache";
import { isPersonalTrackEnabled } from "../utils/personalTrack";
import { shouldShowYesterdayNudge } from "../utils/yesterdayNudge";
import { getHebrewDayEventInfo } from "../utils/hebrewCalendarEvents";
import { useHomeDateNav } from "../hooks/useHomeDateNav";
import { useHomeMarking } from "../hooks/useHomeMarking";
import { useHomeScreenModals } from "../hooks/useHomeScreenModals";
import { useTheme } from "../theme";
import { triggerSelection } from "../utils/haptics";
import type { RootStackParamList, MainTabParamList } from "../navigation/types";
import { HALF_DAF_TIP_VERSION } from "../constants/halfDafTip";

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    showPersonalPickerModal,
    showPersonalDetailModal,
    showQuickJumpModal,
    detailMasechetEn,
    nudgeDismissedFor,
    setDetailMasechetEn,
    openPersonalPicker,
    closePersonalPicker,
    openPersonalDetail,
    closePersonalDetail,
    openQuickJump,
    closeQuickJump,
    dismissNudgeForDay,
  } = useHomeScreenModals();

  const [showPersonalGuideModal, setShowPersonalGuideModal] = useState(false);

  const {
    todayRecord,
    todayMasechet,
    todayDafNum,
    todayMasechetEn,
    todayDafNumValue,
    todayAmud,
    streak,
    recentHistoryKey,
    showSecularDate,
    dismissedHalfDafTip,
    personalTrackEnabled,
    progressCache,
    isAppReady,
    dismissHalfDafTip,
    activePersonalMasechet,
    personalTrackRecords,
    setActivePersonalMasechet,
    clearActivePersonalMasechet,
    togglePersonalDafLearned,
  } = useAppStore(
    useShallow((s) => ({
      todayRecord: s.todayRecord,
      todayMasechet: s.todayMasechet,
      todayDafNum: s.todayDafNum,
      todayMasechetEn: s.todayMasechetEn,
      todayDafNumValue: s.todayDafNumValue,
      todayAmud: s.todayAmud,
      streak: s.streak,
      recentHistoryKey: buildRecentHistoryKey(s.history),
      showSecularDate: s.settings?.show_secular_date === 1,
      dismissedHalfDafTip: s.settings?.dismissed_half_daf_tip,
      personalTrackEnabled: isPersonalTrackEnabled(s.settings),
      progressCache: s.progressCache,
      isAppReady: s.isAppReady,
      dismissHalfDafTip: s.dismissHalfDafTip,
      activePersonalMasechet: s.activePersonalMasechet,
      personalTrackRecords: s.personalTrackRecords,
      setActivePersonalMasechet: s.setActivePersonalMasechet,
      clearActivePersonalMasechet: s.clearActivePersonalMasechet,
      togglePersonalDafLearned: s.togglePersonalDafLearned,
    })),
  );

  const {
    currentDate,
    currentDateStr,
    todayStr,
    isToday,
    isFuture,
    handlePrevDay,
    handleNextDay,
    handleTodayPress,
  } = useHomeDateNav();

  const studyStatus = getStudyStatus(todayRecord);
  const showHalfDafTip =
    dismissedHalfDafTip !== HALF_DAF_TIP_VERSION && studyStatus === "none" && !isFuture;

  const masechetStats = useMemo(() => {
    const total = getMasechetDafim(todayMasechet).length;
    if (!progressCache) return { pct: 0, learned: 0, total };
    const progress = getMasechetProgressFromCache(progressCache, todayMasechet);
    const pct = total > 0 ? Math.round((progress.learned / total) * 100) : 0;
    return { pct, learned: progress.learned, total };
  }, [todayMasechet, progressCache]);

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

  const displayMasechetHe = useMemo(
    () => dafYomiDisplayMasechetHe(todayMasechet, todayDafNumValue),
    [todayMasechet, todayDafNumValue],
  );

  const sharedSubtitle = useMemo(
    () => kinnimTamidCalendarDisplay(todayMasechet, todayDafNumValue)?.subtitleHe,
    [todayMasechet, todayDafNumValue],
  );

  const partialAmud = getPartialAmud(todayRecord);
  const hDate = useMemo(() => new HDate(currentDate), [currentDate]);
  const hebrewDateStr = useMemo(() => hDate.renderGematriya(), [hDate]);
  const gregorianDateStr = useMemo(
    () => `${format(currentDate, "EEEE", { locale: he })} · ${format(currentDate, "dd/MM/yyyy")}`,
    [currentDate],
  );
  const eventName = useMemo(() => getHebrewDayEventInfo(hDate).eventName, [hDate]);

  const shasProgress = useMemo(() => {
    return progressCache?.totalShasProgress || { learnedCount: 0, totalPages: 2711, percentage: 0 };
  }, [progressCache]);

  const last7Days = useMemo(
    () => {
      const settings = useAppStore.getState().settings ?? {};
      return buildLast7Days(useAppStore.getState().history, getDafDayDate(new Date(), settings));
    },
    [recentHistoryKey, todayStr],
  );

  const showYesterdayNudge =
    isToday &&
    nudgeDismissedFor !== todayStr &&
    shouldShowYesterdayNudge(
      useAppStore.getState().history,
      getDafDayDate(new Date(), useAppStore.getState().settings ?? {}),
    );

  const handleOpenTzuratHadaf = useCallback(() => {
    rootNavigation.navigate("TzuratHadaf", {
      masechetEn: todayMasechetEn,
      masechetHe: todayMasechet,
      dafNum: todayDafNumValue,
      amud: partialAmud === "a" ? "b" : todayAmud,
    });
  }, [rootNavigation, todayMasechetEn, todayMasechet, todayDafNumValue, todayAmud, partialAmud]);

  const handleOpenPersonalTzuratHadaf = useCallback((masechetEn: string, dafNum: number) => {
    const match = SHAS_MASECHTOT.find((m) => m.en === masechetEn);
    rootNavigation.navigate("TzuratHadaf", {
      masechetEn,
      masechetHe: match ? match.he : masechetEn,
      dafNum,
      amud: "a",
    });
  }, [rootNavigation]);

  const handleOpenMasechet = useCallback(() => {
    navigation.navigate("History", {
      openMasechetEn: todayMasechetEn,
      returnToHomeOnClose: true,
    });
  }, [navigation, todayMasechetEn]);

  const handleOpenYesterday = useCallback(() => {
    const settings = useAppStore.getState().settings ?? {};
    useAppStore.getState().setCurrentDate(getDafDayYesterday(new Date(), settings));
  }, []);

  const handlePressShas = useCallback(() => {
    navigation.navigate("History");
  }, [navigation]);

  const handleSelectDay = useCallback((date: Date) => {
    void triggerSelection();
    useAppStore.getState().setCurrentDate(date);
  }, []);

  const handleDismissNudge = useCallback(() => {
    dismissNudgeForDay(todayStr);
  }, [dismissNudgeForDay, todayStr]);

  const handleOpenActivePersonalDetail = useCallback(() => {
    openPersonalDetail(activePersonalMasechet);
  }, [activePersonalMasechet, openPersonalDetail]);

  const handleSelectPersonalMasechet = useCallback((mEn: string | null) => {
    setActivePersonalMasechet(mEn);
    setDetailMasechetEn(mEn);
  }, [setActivePersonalMasechet, setDetailMasechetEn]);

  const handleOpenPersonalMasechetDetail = useCallback((mEn: string) => {
    openPersonalDetail(mEn);
  }, [openPersonalDetail]);

  const handleToggleHomeActive = useCallback(() => {
    const current = detailMasechetEn || activePersonalMasechet;
    if (!current) return;
    if (activePersonalMasechet === current) {
      clearActivePersonalMasechet();
    } else {
      setActivePersonalMasechet(current);
    }
  }, [
    activePersonalMasechet,
    clearActivePersonalMasechet,
    detailMasechetEn,
    setActivePersonalMasechet,
  ]);

  const handleQuickJumpNavigate = useCallback((params: {
    masechetEn: string;
    masechetHe: string;
    dafNum: number;
    amud: "a" | "b";
  }) => {
    rootNavigation.navigate("TzuratHadaf", {
      masechetEn: params.masechetEn,
      masechetHe: params.masechetHe,
      dafNum: params.dafNum,
      amud: params.amud,
    });
  }, [rootNavigation]);

  const handleConfettiEnd = useCallback(() => {
    setShowConfetti(false);
  }, [setShowConfetti]);

  if (!isAppReady) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <View style={styles.screenOuter}>
      <ScreenTopGradient />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
                onOpenGuide={() => setShowPersonalGuideModal(true)}
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

      <PersonalMasechetPickerModal
        visible={showPersonalPickerModal}
        selectedMasechetEn={activePersonalMasechet}
        personalTrackRecords={personalTrackRecords}
        onSelectMasechet={handleSelectPersonalMasechet}
        onOpenMasechetDetail={handleOpenPersonalMasechetDetail}
        onClose={closePersonalPicker}
      />

      <PersonalMasechetDetailModal
        visible={showPersonalDetailModal}
        masechetEn={detailMasechetEn || activePersonalMasechet}
        personalTrackRecords={personalTrackRecords}
        isHomeActive={activePersonalMasechet === (detailMasechetEn || activePersonalMasechet)}
        onToggleHomeActive={handleToggleHomeActive}
        onToggleDafLearned={togglePersonalDafLearned}
        onOpenTzuratHadaf={handleOpenPersonalTzuratHadaf}
        onOpenPicker={openPersonalPicker}
        onClose={closePersonalDetail}
      />

      <QuickJumpModal
        visible={showQuickJumpModal}
        initialMasechetEn={todayMasechetEn}
        initialDafNum={todayDafNumValue}
        initialAmud={todayAmud}
        onNavigate={handleQuickJumpNavigate}
        onClose={closeQuickJump}
      />

      <GuideModal
        visible={showPersonalGuideModal}
        onClose={() => setShowPersonalGuideModal(false)}
        initialTab="faq"
        initialQuery="מסלול אישי"
      />

      {siyumMasechet && (
        <SiyumModal
          visible={showSiyumModal}
          masechetHe={siyumMasechet.he}
          totalPages={siyumMasechet.pages}
          onClose={closeSiyum}
        />
      )}

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={200}
            origin={{ x: windowWidth / 2, y: -50 }}
            fadeOut={true}
            fallSpeed={3500}
            explosionSpeed={350}
            colors={[
              theme.colors.accent,
              theme.colors.white,
              theme.colors.gold,
              theme.colors.success,
            ]}
            onAnimationEnd={handleConfettiEnd}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screenOuter: {
      flex: 1,
      position: "relative",
      backgroundColor: theme.colors.background,
    },
    safeArea: { flex: 1, backgroundColor: "transparent" },
    scroll: { flex: 1, backgroundColor: "transparent" },
    scrollContent: { paddingTop: 20, paddingBottom: 24 },
    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: "center",
      alignItems: "center",
      direction: "ltr",
    },
  });
