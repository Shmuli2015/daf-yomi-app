import React from 'react';
import { ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { HDate } from '@hebcal/core';
import { format, subDays } from 'date-fns';
import ConfettiCannon from 'react-native-confetti-cannon';
import HomeHeader from '../components/HomeHeader';
import HomeContent from '../components/HomeContent';
import { getDateStr } from '../utils/dafYomi';
import { getMasechetProgress, getMasechetDafim } from '../utils/shas';
import { THEME } from '../theme';

export default function HomeScreen() {
  const [showConfetti, setShowConfetti] = React.useState(false);

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
  } = useAppStore();

  React.useEffect(() => {
    loadInitialData();
  }, []);

  const isLearned = todayRecord?.status === 'learned';

  const handleToggle = () => {
    if (!isLearned) setShowConfetti(true);
    toggleAnyDafLearned(getDateStr(currentDate), todayMasechet, todayDafNum);
  };

  const hDate = new HDate(currentDate);
  const hebrewDateStr = hDate.renderGematriya();
  const gregorianDateStr = format(currentDate, 'dd/MM/yyyy');

  const masechetTotal = getMasechetDafim(todayMasechet).length;
  const masechetLearned = getMasechetProgress(todayMasechet, history);
  const masechetProgressPct = masechetTotal > 0 ? Math.round((masechetLearned / masechetTotal) * 100) : 0;

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
    <ScrollView
      style={{ flex: 1, backgroundColor: THEME.colors.background }}
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
      />

      <HomeContent
        streak={streak}
        last7Days={last7Days}
      />

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </ScrollView>
  );
}
