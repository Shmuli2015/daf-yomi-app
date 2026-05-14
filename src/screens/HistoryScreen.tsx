import React, { useMemo as useReactMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MasechetGrid from "../components/Shas/MasechetGrid";
import ShasProgressHero from "../components/Shas/ShasProgressHero";
import ScreenTopGradient from "../components/ScreenTopGradient";
import { useAppStore } from "../store/useAppStore";
import { SHAS_MASECHTOT } from "../data/shas";
import { useTheme } from "../theme";

export default function HistoryScreen() {
  const theme = useTheme();
  const styles = useReactMemo(() => createStyles(theme), [theme]);
  const progressCache = useAppStore(state => state.progressCache);

  const totalDafim = useReactMemo(
    () => SHAS_MASECHTOT.reduce((acc, m) => acc + m.pages, 0),
    [],
  );
  
  const learnedDafim = useReactMemo(
    () => progressCache?.totalShasProgress.learnedCount || 0,
    [progressCache],
  );
  
  const completedMasechtot = useReactMemo(
    () => {
      if (!progressCache) return 0;
      return SHAS_MASECHTOT.filter((m) => {
        const progress = progressCache.masechetProgress.get(m.he);
        return progress && progress.total > 0 && progress.learned === progress.total;
      }).length;
    },
    [progressCache],
  );

  const progress = totalDafim > 0 ? learnedDafim / totalDafim : 0;
  const percentage = (progress * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screenRoot}>
        <ScreenTopGradient />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeader}>
            <View style={styles.headerRow}>
              <View style={styles.accentBar} />
              <Text style={styles.pageTitle}>התקדמות בש״ס</Text>
            </View>
            <Text style={styles.pageSubtitle}>מעקב לימוד של כל מסכתות הש״ס</Text>
          </View>

          <ShasProgressHero
            progress={progress}
            percentage={percentage}
            learnedDafim={learnedDafim}
            completedMasechtot={completedMasechtot}
            totalDafim={totalDafim}
          />

          <MasechetGrid />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    screenRoot: { flex: 1, position: "relative" },
    scroll: { flex: 1, backgroundColor: "transparent" },
    content: { paddingTop: 24, paddingBottom: 12 },
    pageHeader: {
      paddingHorizontal: 20,
      marginBottom: 20,
      alignItems: "flex-start",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 4,
    },
    accentBar: {
      width: 4,
      height: 32,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: "900",
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
  });
