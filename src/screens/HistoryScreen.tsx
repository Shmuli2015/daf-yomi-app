import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MasechetGrid from '../components/Shas/MasechetGrid';
import ShasProgressHero from '../components/Shas/ShasProgressHero';
import { useAppStore } from '../store/useAppStore';
import { SHAS_MASECHTOT } from '../data/shas';
import { getMasechetProgress, getMasechetDafim } from '../utils/shas';
import { THEME } from '../theme';

export default function HistoryScreen() {
  const { history } = useAppStore();

  const totalDafim = useMemo(() => SHAS_MASECHTOT.reduce((acc, m) => acc + m.pages, 0), []);
  const learnedDafim = useMemo(() => history.filter(r => r.status === 'learned').length, [history]);
  const completedMasechtos = useMemo(
    () => SHAS_MASECHTOT.filter(m => {
      const total = getMasechetDafim(m.he).length;
      return total > 0 && getMasechetProgress(m.he, history) === total;
    }).length,
    [history]
  );

  const progress = totalDafim > 0 ? learnedDafim / totalDafim : 0;
  const percentage = (progress * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          completedMasechtos={completedMasechtos}
          totalDafim={totalDafim}
        />

        <MasechetGrid />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 100 },
  pageHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  accentBar: {
    width: 4,
    height: 32,
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
});

