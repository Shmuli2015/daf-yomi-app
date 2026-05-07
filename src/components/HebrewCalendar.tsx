import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { HDate, Locale } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { getDafByDate, getDateStr } from '../utils/dafYomi';
import CalendarDay from './Calendar/CalendarDay';
import DafDetailModal from './Calendar/DafDetailModal';
import { THEME } from '../theme';

const DAYS_OF_WEEK = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

interface DayData {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  isToday: boolean;
  dateKey: string;
}

export default function HebrewCalendar() {
  const { history, toggleAnyDafLearned } = useAppStore();
  const [currentHDate, setCurrentHDate] = useState(new HDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<HDate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const gridTranslateX = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(1)).current;

  const animateGridChange = (direction: 'next' | 'prev', changeFn: () => void) => {
    const outDir = direction === 'next' ? -40 : 40;
    Animated.parallel([
      Animated.timing(gridOpacity, { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(gridTranslateX, { toValue: outDir, duration: 170, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      changeFn();
      gridTranslateX.setValue(direction === 'next' ? 40 : -40);
      Animated.parallel([
        Animated.timing(gridOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(gridTranslateX, { toValue: 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });
  };

  const calendarData = useMemo(() => {
    const year = currentHDate.getFullYear();
    const month = currentHDate.getMonth();
    const firstDayOfMonth = new HDate(1, month, year);
    const dayOfWeek = firstDayOfMonth.getDay();
    const days: DayData[] = [];

    const prevMonth = firstDayOfMonth.prev();
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = new HDate(prevMonth.getDate() - i, prevMonth.getMonth(), prevMonth.getFullYear());
      days.push({ hdate: d, isCurrentMonth: false, learned: isLearned(d), isToday: isSameDay(d, new HDate(new Date())), dateKey: getDateStr(d.greg()) });
    }

    let d = firstDayOfMonth;
    while (d.getMonth() === month) {
      days.push({ hdate: d, isCurrentMonth: true, learned: isLearned(d), isToday: isSameDay(d, new HDate(new Date())), dateKey: getDateStr(d.greg()) });
      d = d.next();
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ hdate: d, isCurrentMonth: false, learned: isLearned(d), isToday: isSameDay(d, new HDate()), dateKey: getDateStr(d.greg()) });
      d = d.next();
    }
    return days;
  }, [currentHDate, history]);

  function isLearned(hdate: HDate) {
    return history.some(r => r.date === getDateStr(hdate.greg()) && r.status === 'learned');
  }

  function isSameDay(d1: HDate, d2: HDate | null) {
    if (!d2) return false;
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  const goNextMonth = () => {
    animateGridChange('next', () => {
      const daysInMonth = HDate.daysInMonth(currentHDate.getMonth(), currentHDate.getFullYear());
      const next = new HDate(daysInMonth, currentHDate.getMonth(), currentHDate.getFullYear()).next();
      setCurrentHDate(new HDate(1, next.getMonth(), next.getFullYear()));
    });
  };

  const goPrevMonth = () => {
    animateGridChange('prev', () => {
      const prev = new HDate(1, currentHDate.getMonth(), currentHDate.getFullYear()).prev();
      setCurrentHDate(new HDate(1, prev.getMonth(), prev.getFullYear()));
    });
  };

  const monthName = Locale.gettext(HDate.getMonthName(currentHDate.getMonth(), currentHDate.getFullYear()), 'he').replace(/[\u0591-\u05C7]/g, '');
  const yearName = currentHDate.renderGematriya().split(' ').pop();

  const selectedDafInfo = useMemo(() => {
    if (!selectedDate) return null;
    return getDafByDate(selectedDate.greg());
  }, [selectedDate]);

  return (
    <View style={styles.card}>
      {/* Month Navigator */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goNextMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.monthCenter}>
          <Text style={styles.monthName}>{monthName}</Text>
          <Text style={styles.yearName}>{yearName}</Text>
        </View>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Week day labels */}
      <View style={styles.weekLabels}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Text key={index} style={styles.weekLabel}>{day}</Text>
        ))}
      </View>

      {/* Animated grid */}
      <Animated.View style={{ transform: [{ translateX: gridTranslateX }], opacity: gridOpacity }}>
        <View style={styles.grid}>
          {calendarData.map((day, index) => (
            <CalendarDay
              key={index}
              hdate={day.hdate}
              isCurrentMonth={day.isCurrentMonth}
              learned={day.learned}
              isToday={day.isToday}
              isSelected={isSameDay(day.hdate, selectedDate)}
              onPress={(hd) => { setSelectedDate(hd); setModalVisible(true); }}
            />
          ))}
        </View>
      </Animated.View>

      <DafDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        dafInfo={selectedDafInfo}
        isLearned={selectedDate ? isLearned(selectedDate) : false}
        onToggle={() => {
          if (selectedDate && selectedDafInfo) {
            toggleAnyDafLearned(getDateStr(selectedDate.greg()), selectedDafInfo.masechet, selectedDafInfo.daf);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  monthCenter: { alignItems: 'center' },
  monthName: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: -0.3,
  },
  yearName: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  weekLabels: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '900',
    color: THEME.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
});
