import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { HDate } from '@hebcal/core';
import { format, subDays } from 'date-fns';

import ConfettiCannon from 'react-native-confetti-cannon';
import HomeHeader from '../components/HomeHeader';
import HomeContent from '../components/HomeContent';

export default function HomeScreen() {
  const [showConfetti, setShowConfetti] = React.useState(false);
  const explosion = React.useRef<any>(null);

  const { 
    currentDate, 
    todayRecord, 
    todayMasechet, 
    todayDafNum, 
    todaySefariaUrl,
    streak, 
    toggleAnyDafLearned, 
    history 
  } = useAppStore();

  const isLearned = todayRecord?.status === 'learned';

  const handleToggle = () => {
    if (!isLearned) {
      setShowConfetti(true);
    }
    toggleAnyDafLearned(currentDate.toISOString().split('T')[0], todayMasechet, todayDafNum);
  };
  const hDate = new HDate(currentDate);
  const hebrewDateStr = hDate.renderGematriya();
  const gregorianDateStr = format(currentDate, 'dd/MM/yyyy');

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(currentDate, 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const record = history.find(r => r.date === dateStr);
    return {
      date: d,
      dateStr,
      status: record?.status || 'missed',
      dayName: format(d, 'EEEEEE')
    };
  });

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
      <HomeHeader 
        gregorianDateStr={gregorianDateStr}
        hebrewDateStr={hebrewDateStr}
        todayMasechet={todayMasechet}
        todayDafNum={todayDafNum}
        sefariaUrl={todaySefariaUrl}
      />

      <HomeContent 
        isLearned={isLearned}
        handleToggle={handleToggle}
        streak={streak}
      />

      {showConfetti && (
        <ConfettiCannon 
          count={200} 
          origin={{x: -10, y: 0}} 
          fadeOut={true}
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </ScrollView>
  );
}
