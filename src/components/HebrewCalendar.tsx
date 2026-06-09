import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, useWindowDimensions, PanResponder } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { HDate, Locale } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { getStudyStatus } from '../utils/dafStatus';
import { getDafByDate, getDateStr } from '../utils/dafYomi';
import CalendarDay from './Calendar/CalendarDay';
import DafDetailModal from './Calendar/DafDetailModal';
import ConfirmModal from './ConfirmModal';
import DafMarkMenuModal from './DafMarkMenuModal';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const DAYS_OF_WEEK = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

interface DayData {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  partial: boolean;
  isToday: boolean;
  dateKey: string;
  dafLabel?: string;
}

export default function HebrewCalendar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { history, toggleAnyDafLearned, setDafStudyStatus, settings } = useAppStore(
    useShallow((s) => ({
      history: s.history,
      toggleAnyDafLearned: s.toggleAnyDafLearned,
      setDafStudyStatus: s.setDafStudyStatus,
      settings: s.settings,
    })),
  );
  const recordByDate = useMemo(() => new Map(history.map((r) => [r.date, r])), [history]);
  const showCalendarDaf = settings?.show_calendar_daf === 1;
  const [currentHDate, setCurrentHDate] = useState(new HDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<HDate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const gridTranslateX = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(1)).current;

  const SLIDE_PX = 40;
  const animateGridChange = useCallback((direction: 'next' | 'prev', changeFn: () => void) => {
    const outDir = direction === 'next' ? SLIDE_PX : -SLIDE_PX;
    const enterFrom = direction === 'next' ? -SLIDE_PX : SLIDE_PX;

    Animated.parallel([
      Animated.timing(gridOpacity, { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(gridTranslateX, { toValue: outDir, duration: 170, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      changeFn();
      gridTranslateX.setValue(enterFrom);
      Animated.parallel([
        Animated.timing(gridOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(gridTranslateX, { toValue: 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });
  }, [gridOpacity, gridTranslateX]);

  const handleDayPress = useCallback((hd: HDate) => {
    setSelectedDate(hd);
    setModalVisible(true);

    const hdMonth = hd.getMonth();
    const hdYear = hd.getFullYear();
    const currentMonth = currentHDate.getMonth();
    const currentYear = currentHDate.getFullYear();

    if (hdMonth !== currentMonth || hdYear !== currentYear) {
      const direction = (hdYear > currentYear || (hdYear === currentYear && hdMonth > currentMonth))
        ? 'next'
        : 'prev';
      
      animateGridChange(direction, () => {
        setCurrentHDate(new HDate(1, hdMonth, hdYear));
      });
    }
  }, [currentHDate, animateGridChange]);

  const calendarData = useMemo(() => {
    const year = currentHDate.getFullYear();
    const month = currentHDate.getMonth();
    const firstDayOfMonth = new HDate(1, month, year);
    const dayOfWeek = firstDayOfMonth.getDay();
    const days: DayData[] = [];

    const todayHd = new HDate(new Date());
    const prevMonth = firstDayOfMonth.prev();
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = new HDate(prevMonth.getDate() - i, prevMonth.getMonth(), prevMonth.getFullYear());
      const dateKey = getDateStr(d.greg());
      const record = recordByDate.get(dateKey);
      const studyStatus = getStudyStatus(record);
      days.push({
        hdate: d,
        isCurrentMonth: false,
        learned: studyStatus === 'learned',
        partial: studyStatus === 'partial',
        isToday: isSameDay(d, todayHd),
        dateKey,
        dafLabel: showCalendarDaf ? getDafByDate(d.greg()).dafNumOnly || undefined : undefined,
      });
    }

    let d = firstDayOfMonth;
    while (d.getMonth() === month) {
      const dateKey = getDateStr(d.greg());
      const record = recordByDate.get(dateKey);
      const studyStatus = getStudyStatus(record);
      days.push({
        hdate: d,
        isCurrentMonth: true,
        learned: studyStatus === 'learned',
        partial: studyStatus === 'partial',
        isToday: isSameDay(d, todayHd),
        dateKey,
        dafLabel: showCalendarDaf ? getDafByDate(d.greg()).dafNumOnly || undefined : undefined,
      });
      d = d.next();
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const dateKey = getDateStr(d.greg());
      const record = recordByDate.get(dateKey);
      const studyStatus = getStudyStatus(record);
      days.push({
        hdate: d,
        isCurrentMonth: false,
        learned: studyStatus === 'learned',
        partial: studyStatus === 'partial',
        isToday: isSameDay(d, new HDate()),
        dateKey,
        dafLabel: showCalendarDaf ? getDafByDate(d.greg()).dafNumOnly || undefined : undefined,
      });
      d = d.next();
    }
    return days;
  }, [currentHDate, recordByDate, showCalendarDaf]);


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

  const isViewingTodayMonth = useMemo(() => {
    const today = new HDate(new Date());
    return (
      currentHDate.getMonth() === today.getMonth() && currentHDate.getFullYear() === today.getFullYear()
    );
  }, [currentHDate]);

  const goToToday = () => {
    const today = new HDate(new Date());
    if (currentHDate.getMonth() === today.getMonth() && currentHDate.getFullYear() === today.getFullYear()) return;

    const direction = (today.getFullYear() > currentHDate.getFullYear() || 
                      (today.getFullYear() === currentHDate.getFullYear() && today.getMonth() > currentHDate.getMonth())) 
                      ? 'next' : 'prev';
    
    animateGridChange(direction, () => {
      setCurrentHDate(today);
    });
  };

  const swipeHandlers = useRef({ goNextMonth, goPrevMonth });
  swipeHandlers.current = { goNextMonth, goPrevMonth };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          swipeHandlers.current.goNextMonth();
        } else if (gestureState.dx < -50) {
          swipeHandlers.current.goPrevMonth();
        }
      },
    })
  ).current;

  const selectedDafInfo = useMemo(() => {
    if (!selectedDate) return null;
    return getDafByDate(selectedDate.greg());
  }, [selectedDate]);

  const handleOpenTzuratHadaf = useCallback(() => {
    if (!selectedDafInfo) return;
    setModalVisible(false);
    navigation.navigate('TzuratHadaf', {
      masechetEn: selectedDafInfo.masechetEn,
      masechetHe: selectedDafInfo.masechet,
      dafNum: selectedDafInfo.dafNum,
      amud: selectedDafInfo.amud,
    });
  }, [navigation, selectedDafInfo]);

  return (
    <Reanimated.View entering={FadeInDown.duration(400).springify()} style={styles.card} {...panResponder.panHandlers}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.monthCenter}>
          <Text style={styles.monthName}>{monthName}</Text>
          <Text style={styles.yearName}>{yearName}</Text>
          {!isViewingTodayMonth && (
            <TouchableOpacity
              onPress={goToToday}
              style={styles.todayBtn}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="חזרה לחודש של היום בלוח"
            >
              <Ionicons name="today-outline" size={18} color={theme.colors.accent} />
              <Text style={styles.todayBtnLabel}>חזרה להיום</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={goNextMonth} style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekLabels}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Text key={index} style={styles.weekLabel}>{day}</Text>
        ))}
      </View>

      <Animated.View style={{ transform: [{ translateX: gridTranslateX }], opacity: gridOpacity }}>
        <View style={styles.grid}>
          {calendarData.map((day) => (
            <CalendarDay
              key={day.dateKey}
              hdate={day.hdate}
              isCurrentMonth={day.isCurrentMonth}
              learned={day.learned}
              partial={day.partial}
              isToday={day.isToday}
              isSelected={isSameDay(day.hdate, selectedDate)}
              dafLabel={day.dafLabel}
              onPress={handleDayPress}
            />
          ))}
        </View>
      </Animated.View>

      <DafDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        dafInfo={selectedDafInfo}
        studyStatus={
          selectedDate
            ? getStudyStatus(recordByDate.get(getDateStr(selectedDate.greg())))
            : 'none'
        }
        onToggle={() => {
          if (selectedDate && selectedDafInfo) {
            const dateKey = getDateStr(selectedDate.greg());
            const currentStatus = getStudyStatus(recordByDate.get(dateKey));
            if (currentStatus === 'learned') {
              setShowConfirm(true);
            } else if (currentStatus === 'partial') {
              if (settings?.show_confetti) setShowConfetti(true);
              setDafStudyStatus(dateKey, selectedDafInfo.masechet, selectedDafInfo.daf, 'learned');
              setModalVisible(false);
            } else {
              if (settings?.show_confetti) setShowConfetti(true);
              toggleAnyDafLearned(dateKey, selectedDafInfo.masechet, selectedDafInfo.daf);
              setModalVisible(false);
            }
          }
        }}
        onLongPressToggle={() => setShowMarkMenu(true)}
        onOpenTzuratHadaf={handleOpenTzuratHadaf}
      />

      <DafMarkMenuModal
        visible={showMarkMenu}
        onSelectFull={() => {
          if (selectedDate && selectedDafInfo) {
            if (settings?.show_confetti) setShowConfetti(true);
            setDafStudyStatus(
              getDateStr(selectedDate.greg()),
              selectedDafInfo.masechet,
              selectedDafInfo.daf,
              'learned',
            );
          }
          setShowMarkMenu(false);
          setModalVisible(false);
        }}
        onSelectHalfA={() => {
          if (selectedDate && selectedDafInfo) {
            setDafStudyStatus(
              getDateStr(selectedDate.greg()),
              selectedDafInfo.masechet,
              selectedDafInfo.daf,
              'partial',
            );
          }
          setShowMarkMenu(false);
          setModalVisible(false);
        }}
        onSelectHalfB={() => {
          if (selectedDate && selectedDafInfo) {
            setDafStudyStatus(
              getDateStr(selectedDate.greg()),
              selectedDafInfo.masechet,
              selectedDafInfo.daf,
              'partial',
            );
          }
          setShowMarkMenu(false);
          setModalVisible(false);
        }}
        showUnmark={
          selectedDate
            ? getStudyStatus(recordByDate.get(getDateStr(selectedDate.greg()))) === 'partial'
            : false
        }
        onUnmark={() => {
          setShowMarkMenu(false);
          setShowConfirm(true);
        }}
        onCancel={() => setShowMarkMenu(false)}
      />

      <ConfirmModal
        visible={showConfirm}
        title="ביטול לימוד"
        message="האם אתה בטוח שברצונך לבטל את סימון הדף?"
        onConfirm={() => {
          if (selectedDate && selectedDafInfo) {
            toggleAnyDafLearned(getDateStr(selectedDate.greg()), selectedDafInfo.masechet, selectedDafInfo.daf);
          }
          setShowConfirm(false);
          setModalVisible(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />

      {showConfetti && (
        <View 
          style={styles.confettiContainer}
          pointerEvents="none"
        >
          <ConfettiCannon
            count={200}
            origin={{ x: windowWidth / 2, y: -50 }}
            fadeOut={true}
            fallSpeed={3500}
            explosionSpeed={350}
            colors={[theme.colors.accent, '#FFFFFF', '#FFD700', theme.colors.success]}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}
    </Reanimated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 32,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
      direction: 'rtl',
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
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    monthCenter: { alignItems: 'center' },
    monthName: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: -0.3,
    },
    yearName: {
      fontSize: 11,
      color: theme.colors.accent,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    todayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accent,
    },
    todayBtnLabel: {
      fontSize: 13,
      color: theme.colors.accent,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    weekLabels: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    weekLabel: {
      width: '14.28%',
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '900',
      color: theme.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      direction: 'ltr',
    },
  });
