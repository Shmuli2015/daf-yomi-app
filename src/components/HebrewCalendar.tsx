import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import Reanimated from 'react-native-reanimated';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import CalendarDay from './Calendar/CalendarDay';
import DafDetailModal from './Calendar/DafDetailModal';
import ConfirmModal from './ConfirmModal';
import DafMarkMenuModal from './DafMarkMenuModal';
import MonthlyProgressCard from './Calendar/MonthlyProgressCard';
import MonthYearPickerModal from './Calendar/MonthYearPickerModal';
import MonthTractateBanner from './Calendar/MonthTractateBanner';
import CompactCalendarLegend from './Calendar/CompactCalendarLegend';
import CalendarTodayButton from './Calendar/CalendarTodayButton';
import CatchUpModal from './Calendar/CatchUpModal';
import { useCalendarData } from './Calendar/useCalendarData';
import { useCalendarMonth, isSameDay } from './Calendar/useCalendarMonth';
import { useCalendarActions } from './Calendar/useCalendarActions';
import { createHebrewCalendarStyles } from './Calendar/HebrewCalendar.styles';
import { useTheme } from '../theme';

const DAYS_OF_WEEK = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export default function HebrewCalendar() {
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createHebrewCalendarStyles(theme), [theme]);

  const { recordByDate, showCalendarDaf, showConfetti: showConfettiSetting } = useCalendarData();

  const {
    currentHDate,
    setCurrentHDate,
    calendarData,
    monthlyStats,
    monthName,
    yearName,
    isViewingTodayMonth,
    monthTractateSummary,
    monthTractateShort,
    gridTranslateX,
    gridOpacity,
    panResponder,
    goNextMonth,
    goPrevMonth,
    goToToday,
    animateGridChange,
  } = useCalendarMonth({ recordByDate, showCalendarDaf });

  const {
    selectedDate,
    selectedDafInfo,
    modalVisible,
    setModalVisible,
    showConfirm,
    setShowConfirm,
    showCatchUpModal,
    setShowCatchUpModal,
    showMarkMenu,
    setShowMarkMenu,
    showConfetti,
    setShowConfetti,
    showMonthPicker,
    setShowMonthPicker,
    missedDaysUpToSelected,
    currentStudyStatus,
    currentPartialAmud,
    handleDayPress,
    handleOpenTzuratHadaf,
    handlePrevDay,
    handleNextDay,
    handleCatchUpConfirm,
    handleToggleStudy,
    handleConfirmUnmark,
    handleMarkMenuSelectFull,
    handleMarkMenuSelectHalf,
    handleMarkMenuUnmark,
  } = useCalendarActions({
    currentHDate,
    setCurrentHDate,
    animateGridChange,
    recordByDate,
    showConfettiSetting,
  });

  return (
    <View style={styles.container}>
      <MonthlyProgressCard
        learnedCount={monthlyStats.learnedCount}
        totalCount={monthlyStats.totalCount}
        tractateLabel={monthTractateShort}
      />

      <Reanimated.View style={styles.card} {...panResponder.panHandlers}>
        <View style={styles.navRow}>
          <View style={styles.navControls}>
            <TouchableOpacity
              onPress={goPrevMonth}
              style={styles.navBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="חודש קודם"
            >
              <Ionicons name="chevron-forward" size={17} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNextMonth}
              style={styles.navBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="חודש הבא"
            >
              <Ionicons name="chevron-back" size={17} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowMonthPicker(true)}
            style={styles.monthPickerButton}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="בחירת חודש ושנה"
          >
            <Text style={styles.monthPickerText}>{monthName} {yearName}</Text>
            <Ionicons name="chevron-down" size={13} color={theme.colors.accent} />
          </TouchableOpacity>

          <CalendarTodayButton
            isCurrentMonth={isViewingTodayMonth}
            onPress={goToToday}
          />
        </View>

        <MonthTractateBanner summary={monthTractateSummary} />

        <View style={styles.weekLabels}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={index} style={styles.weekLabelWrapper}>
              <Text
                style={[
                  styles.weekLabel,
                  day === 'ש' && styles.weekLabelShabbat,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <Animated.View style={{ flex: 1, justifyContent: 'space-between', transform: [{ translateX: gridTranslateX }], opacity: gridOpacity }}>
          <View style={styles.grid}>
            {calendarData.map((day) => (
              <CalendarDay
                key={day.dateKey}
                hdate={day.hdate}
                isCurrentMonth={day.isCurrentMonth}
                learned={day.learned}
                partial={day.partial}
                partialAmud={day.partialAmud}
                isToday={day.isToday}
                isSelected={isSameDay(day.hdate, selectedDate)}
                dafLabel={day.dafLabel}
                hasSpecialEvent={day.hasSpecialEvent}
                onPress={handleDayPress}
              />
            ))}
          </View>
        </Animated.View>
      </Reanimated.View>

      <CompactCalendarLegend />

      <DafDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        dafInfo={selectedDafInfo}
        studyStatus={currentStudyStatus}
        partialAmud={currentPartialAmud}
        onToggle={handleToggleStudy}
        onLongPressToggle={() => setShowMarkMenu(true)}
        onOpenTzuratHadaf={handleOpenTzuratHadaf}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onCatchUp={() => setShowCatchUpModal(true)}
        missedCount={missedDaysUpToSelected.length}
      />

      <MonthYearPickerModal
        visible={showMonthPicker}
        currentYear={currentHDate.getFullYear()}
        currentMonth={currentHDate.getMonth()}
        onSelect={(m, y) => setCurrentHDate(new HDate(1, m, y))}
        onClose={() => setShowMonthPicker(false)}
      />

      <DafMarkMenuModal
        visible={showMarkMenu}
        onSelectFull={handleMarkMenuSelectFull}
        onSelectHalfA={() => handleMarkMenuSelectHalf('a')}
        onSelectHalfB={() => handleMarkMenuSelectHalf('b')}
        partialAmud={currentPartialAmud}
        showUnmark={currentStudyStatus === 'partial'}
        onUnmark={handleMarkMenuUnmark}
        onCancel={() => setShowMarkMenu(false)}
      />

      <ConfirmModal
        visible={showConfirm}
        title="ביטול לימוד"
        message="האם אתה בטוח שברצונך לבטל את סימון הדף?"
        onConfirm={handleConfirmUnmark}
        onCancel={() => setShowConfirm(false)}
      />

      <CatchUpModal
        visible={showCatchUpModal}
        items={missedDaysUpToSelected}
        onConfirm={handleCatchUpConfirm}
        onClose={() => setShowCatchUpModal(false)}
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
            colors={[theme.colors.accent, theme.colors.white, theme.colors.gold, theme.colors.success]}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}
    </View>
  );
}
