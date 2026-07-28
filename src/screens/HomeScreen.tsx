import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import React, { useMemo, useState, useCallback } from "react";
import { HDate } from "@hebcal/core";
import { format, subDays, addDays } from "date-fns";
import { he } from "date-fns/locale/he";
import ConfettiCannon from "react-native-confetti-cannon";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import HomeHeader from "../components/HomeHeader";
import HomeContent from "../components/HomeContent";
import ShasBanner from "../components/ShasBanner";
import ScreenTopGradient from "../components/ScreenTopGradient";
import { getDateStr } from "../utils/dafYomi";
import { getMasechetDafim } from "../utils/shas";
import { getStudyStatus, formatProgressCount, getPartialAmud } from "../utils/dafStatus";
import { getMasechetProgressFromCache } from "../utils/progressCache";
import { useTheme } from "../theme";
import type { RootStackParamList, MainTabParamList } from "../navigation/types";
import { parseStudyLinkMode, shouldShowSefariaLink, shouldShowTzuratLink } from "../utils/studyLinkMode";
import { GuideModal } from "../components/Settings/GuideModal";

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const {
    currentDate,
    todayRecord,
    todayMasechet,
    todayDafNum,
    todaySefariaUrl,
    todayMasechetEn,
    todayDafNumValue,
    todayAmud,
    loadInitialData,
    streak,
    toggleAnyDafLearned,
    setDafStudyStatus,
    markPartialAmud,
    history,
    settings,
    progressCache,
    isAppReady,
    setCurrentDate,
  } = useAppStore(
    useShallow((s) => ({
      currentDate: s.currentDate,
      todayRecord: s.todayRecord,
      todayMasechet: s.todayMasechet,
      todayDafNum: s.todayDafNum,
      todaySefariaUrl: s.todaySefariaUrl,
      todayMasechetEn: s.todayMasechetEn,
      todayDafNumValue: s.todayDafNumValue,
      todayAmud: s.todayAmud,
      loadInitialData: s.loadInitialData,
      streak: s.streak,
      toggleAnyDafLearned: s.toggleAnyDafLearned,
      setDafStudyStatus: s.setDafStudyStatus,
      markPartialAmud: s.markPartialAmud,
      history: s.history,
      settings: s.settings,
      progressCache: s.progressCache,
      isAppReady: s.isAppReady,
      setCurrentDate: s.setCurrentDate,
    })),
  );

  React.useEffect(() => {
    loadInitialData();
  }, []);

  const studyStatus = getStudyStatus(todayRecord);
  const isLearned = studyStatus === "learned";

  const handleToggle = useCallback(() => {
    if (!isLearned && studyStatus !== "partial" && settings?.show_confetti) setShowConfetti(true);
    toggleAnyDafLearned(getDateStr(currentDate), todayMasechet, todayDafNum);
  }, [isLearned, studyStatus, settings, currentDate, todayMasechet, todayDafNum, toggleAnyDafLearned]);

  const handleMarkFull = useCallback(() => {
    if (settings?.show_confetti && studyStatus !== "learned") setShowConfetti(true);
    setDafStudyStatus(getDateStr(currentDate), todayMasechet, todayDafNum, "learned");
  }, [settings, studyStatus, currentDate, todayMasechet, todayDafNum, setDafStudyStatus]);

  const handleMarkPartialA = useCallback(() => {
    markPartialAmud(getDateStr(currentDate), todayMasechet, todayDafNum, "a");
  }, [currentDate, todayMasechet, todayDafNum, markPartialAmud]);

  const handleMarkPartialB = useCallback(() => {
    markPartialAmud(getDateStr(currentDate), todayMasechet, todayDafNum, "b");
  }, [currentDate, todayMasechet, todayDafNum, markPartialAmud]);

  const partialAmud = getPartialAmud(todayRecord);

  const hDate = useMemo(() => new HDate(currentDate), [currentDate]);
  const hebrewDateStr = useMemo(() => hDate.renderGematriya(), [hDate]);
  const gregorianDateStr = useMemo(
    () =>
      `${format(currentDate, "EEEE", { locale: he })} · ${format(currentDate, "dd/MM/yyyy")}`,
    [currentDate],
  );

  const handlePrevDay = useCallback(() => {
    setCurrentDate(subDays(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const handleNextDay = useCallback(() => {
    setCurrentDate(addDays(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const isToday = useMemo(() => {
    return getDateStr(currentDate) === getDateStr(new Date());
  }, [currentDate]);

  const masechetStats = useMemo(() => {
    const total = getMasechetDafim(todayMasechet).length;
    if (!progressCache) return { pct: 0, learned: 0, total };
    const progress = getMasechetProgressFromCache(progressCache, todayMasechet);
    const pct = total > 0 ? Math.round((progress.learned / total) * 100) : 0;
    return { pct, learned: progress.learned, total };
  }, [todayMasechet, progressCache]);

  const shasProgress = useMemo(() => {
    return progressCache?.totalShasProgress || { learnedCount: 0, totalPages: 2711, percentage: 0 };
  }, [progressCache]);

  const last7Days = useMemo(() => {
    const daysHe = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(currentDate, 6 - i);
      const dateStr = getDateStr(d);
      const record = history.find((r) => r.date === dateStr);
      return {
        date: d,
        dateStr,
        status: record?.status || "missed",
        dayName: format(d, "EEEEEE"),
        dayNameHe: daysHe[d.getDay()],
      };
    });
  }, [history, currentDate]);

  const studyLinkMode = parseStudyLinkMode(settings?.study_link_mode);
  const showSefariaLink = shouldShowSefariaLink(studyLinkMode);
  const showTzuratLink = shouldShowTzuratLink(studyLinkMode);

  const handleOpenTzuratHadaf = useCallback(() => {
    rootNavigation.navigate('TzuratHadaf', {
      masechetEn: todayMasechetEn,
      masechetHe: todayMasechet,
      dafNum: todayDafNumValue,
      amud: todayAmud,
    });
  }, [rootNavigation, todayMasechetEn, todayMasechet, todayDafNumValue, todayAmud]);

  const handleOpenMasechet = useCallback(() => {
    navigation.navigate("History", {
      openMasechetEn: todayMasechetEn,
      returnToHomeOnClose: true,
    });
  }, [navigation, todayMasechetEn]);

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
        <HomeHeader
          gregorianDateStr={gregorianDateStr}
          hebrewDateStr={hebrewDateStr}
          todayMasechet={todayMasechet}
          todayDafNum={todayDafNum}
          sefariaUrl={todaySefariaUrl}
          showSefariaLink={showSefariaLink}
          showTzuratLink={showTzuratLink}
          onOpenTzuratHadaf={handleOpenTzuratHadaf}
          onPressMasechet={handleOpenMasechet}
          studyStatus={studyStatus}
          handleToggle={handleToggle}
          onMarkFull={handleMarkFull}
          onMarkPartialA={handleMarkPartialA}
          onMarkPartialB={handleMarkPartialB}
          partialAmud={partialAmud}
          masechetProgressPct={masechetStats.pct}
          masechetLearnedCountLabel={formatProgressCount(masechetStats.learned)}
          masechetTotalCount={masechetStats.total}
          showSecularDate={settings?.show_secular_date === 1}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onTodayPress={() => loadInitialData()}
          isToday={isToday}
          currentDate={currentDate}
        />


        <View style={{ height: 20 }} />

        <ShasBanner
          learnedCount={shasProgress.learnedCount}
          totalPages={shasProgress.totalPages}
          percentage={shasProgress.percentage}
          onPress={() => navigation.navigate("History")}
        />

        <View style={{ height: 20 }} />

        <HomeContent streak={streak} last7Days={last7Days} hebrewDateStr={hebrewDateStr} />

        <TouchableOpacity
          onPress={() => setShowGuideModal(true)}
          style={styles.bottomGuideBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="help-circle-outline" size={18} color={theme.colors.accent} />
          <Text style={styles.bottomGuideText}>מדריך לשימוש באפליקציה</Text>
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>

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
              "#FFFFFF",
              "#FFD700",
              theme.colors.success,
            ]}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}

      <GuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
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
    scrollContent: { paddingTop: 24, paddingBottom: 24 },
    bottomGuideBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 12,
      marginBottom: 16,
      alignSelf: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    bottomGuideText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "700",
    },
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
