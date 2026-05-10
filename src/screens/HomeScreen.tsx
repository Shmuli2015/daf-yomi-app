import { ScrollView, View, Dimensions, I18nManager, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import React, { useState } from 'react';
import { HDate } from '@hebcal/core';
import { format, subDays } from 'date-fns';
import ConfettiCannon from 'react-native-confetti-cannon';
import HomeHeader from '../components/HomeHeader';
import HomeContent from '../components/HomeContent';
import ShasBanner from '../components/ShasBanner';
import { getDateStr } from '../utils/dafYomi';
import { getMasechetProgress, getMasechetDafim, getTotalShasProgress } from '../utils/shas';
import { THEME } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
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
  } = useAppStore();

  React.useEffect(() => {
    loadInitialData();
  }, []);

  const isLearned = todayRecord?.status === 'learned';

  const handleToggle = () => {
    if (!isLearned && settings?.show_confetti) setShowConfetti(true);
    toggleAnyDafLearned(getDateStr(currentDate), todayMasechet, todayDafNum);
  };

  const hDate = new HDate(currentDate);
  const hebrewDateStr = hDate.renderGematriya();
  const gregorianDateStr = format(currentDate, 'dd/MM/yyyy');

  const masechetTotal = getMasechetDafim(todayMasechet).length;
  const masechetLearned = getMasechetProgress(todayMasechet, history);
  const masechetProgressPct = masechetTotal > 0 ? Math.round((masechetLearned / masechetTotal) * 100) : 0;

  const shasProgress = getTotalShasProgress(history);

  const last7Days = React.useMemo(() => {
    const daysHe = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(currentDate, 6 - i);
      const dateStr = getDateStr(d);
      const record = history.find(r => r.date === dateStr);
      return {
        date: d,
        dateStr,
        status: record?.status || 'missed',
        dayName: format(d, 'EEEEEE'),
        dayNameHe: daysHe[d.getDay()],
      };
    });
  }, [history, currentDate]);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
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
          onPress={() => navigation.navigate('History')}
        />

        <View style={{ height: 24 }} />

        <HomeContent
          streak={streak}
          last7Days={last7Days}
        />
      </ScrollView>

      {showConfetti && (
        <View 
          style={styles.confettiContainer}
          pointerEvents="none"
        >
          <ConfettiCannon
            count={200}
            origin={{ x: SCREEN_WIDTH / 2, y: -50 }}
            fadeOut={true}
            fallSpeed={3500}
            explosionSpeed={350}
            colors={[THEME.colors.accent, '#FFFFFF', '#FFD700', THEME.colors.success]}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    // @ts-ignore
    direction: 'ltr',
  },
});
