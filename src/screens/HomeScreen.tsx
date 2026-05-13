import {
  ScrollView,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useAppStore } from "../store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import React, { useMemo, useState, useCallback } from "react";
import { HDate } from "@hebcal/core";
import { format, subDays } from "date-fns";
import ConfettiCannon from "react-native-confetti-cannon";
import HomeHeader from "../components/HomeHeader";
import HomeContent from "../components/HomeContent";
import ShasBanner from "../components/ShasBanner";
import { getDateStr } from "../utils/dafYomi";
import { getMasechetDafim } from "../utils/shas";
import { getMasechetProgressFromCache } from "../utils/progressCache";
import { useTheme } from "../theme";

export default function HomeScreen({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    currentDate,
    todayRecord,
    todayMasechet,
    todayDafNum,
    todaySefariaUrl,
    loadInitialData,
    streak,
    toggleAnyDafLearned,
    history,
    settings,
    progressCache,
    isAppReady,
  } = useAppStore(
    useShallow((s) => ({
      currentDate: s.currentDate,
      todayRecord: s.todayRecord,
      todayMasechet: s.todayMasechet,
      todayDafNum: s.todayDafNum,
      todaySefariaUrl: s.todaySefariaUrl,
      loadInitialData: s.loadInitialData,
      streak: s.streak,
      toggleAnyDafLearned: s.toggleAnyDafLearned,
      history: s.history,
      settings: s.settings,
      progressCache: s.progressCache,
      isAppReady: s.isAppReady,
    })),
  );

  React.useEffect(() => {
    loadInitialData();
  }, []);

  const isLearned = todayRecord?.status === "learned";

  const handleToggle = useCallback(() => {
    if (!isLearned && settings?.show_confetti) setShowConfetti(true);
    toggleAnyDafLearned(getDateStr(currentDate), todayMasechet, todayDafNum);
  }, [isLearned, settings, currentDate, todayMasechet, todayDafNum, toggleAnyDafLearned]);

  const hDate = useMemo(() => new HDate(currentDate), [currentDate]);
  const hebrewDateStr = useMemo(() => hDate.renderGematriya(), [hDate]);
  const gregorianDateStr = useMemo(() => format(currentDate, "dd/MM/yyyy"), [currentDate]);

  const masechetProgressPct = useMemo(() => {
    const total = getMasechetDafim(todayMasechet).length;
    if (!progressCache) return 0;
    const progress = getMasechetProgressFromCache(progressCache, todayMasechet);
    return total > 0 ? Math.round((progress.learned / total) * 100) : 0;
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

  if (!isAppReady) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          gregorianDateStr={gregorianDateStr}
          hebrewDateStr={hebrewDateStr}
          todayMasechet={todayMasechet}
          todayDafNum={todayDafNum}
          sefariaUrl={todaySefariaUrl}
          isLearned={isLearned}
          handleToggle={handleToggle}
          masechetProgressPct={masechetProgressPct}
          showSecularDate={settings?.show_secular_date === 1}
        />

        <View style={{ height: 24 }} />

        <ShasBanner
          learnedCount={shasProgress.learnedCount}
          totalPages={shasProgress.totalPages}
          percentage={shasProgress.percentage}
          onPress={() => navigation.navigate("History")}
        />

        <View style={{ height: 24 }} />

        <HomeContent streak={streak} last7Days={last7Days} />
      </ScrollView>

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
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
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
