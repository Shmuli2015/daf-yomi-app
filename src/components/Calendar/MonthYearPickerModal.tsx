import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HDate, Locale } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import { getYearMonthsTractates } from '../../utils/monthTractates';
import { useTheme } from '../../theme';
import { triggerSelection } from '../../utils/haptics';
import { createMonthYearPickerModalStyles } from './MonthYearPickerModal.styles';

interface MonthYearPickerModalProps {
  visible: boolean;
  currentYear: number;
  currentMonth: number;
  onSelect: (month: number, year: number) => void;
  onClose: () => void;
}

const NIKUD_REGEX = /[\u0591-\u05C7]/g;

export default function MonthYearPickerModal({
  visible,
  currentYear,
  currentMonth,
  onSelect,
  onClose,
}: MonthYearPickerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createMonthYearPickerModalStyles(theme), [theme]);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    if (visible) {
      setSelectedYear(currentYear);
    }
  }, [visible, currentYear]);

  const todayHDate = useMemo(() => new HDate(), []);
  const todayYear = todayHDate.getFullYear();
  const todayMonth = todayHDate.getMonth();

  const isLeapYear = useMemo(() => HDate.isLeapYear(selectedYear), [selectedYear]);

  const yearLabel = useMemo(() => {
    return new HDate(1, 7, selectedYear).renderGematriya().split(' ').pop() || String(selectedYear);
  }, [selectedYear]);

  const months = useMemo(() => {
    const order = isLeapYear
      ? [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6]
      : [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

    return order.map((m) => {
      const rawName = Locale.gettext(HDate.getMonthName(m, selectedYear), 'he');
      const name = rawName.replace(NIKUD_REGEX, '');
      return { num: m, name };
    });
  }, [selectedYear, isLeapYear]);

  const yearTractates = useMemo(() => {
    return getYearMonthsTractates(selectedYear);
  }, [selectedYear]);

  const handlePrevYear = () => {
    setSelectedYear((y) => y - 1);
    triggerSelection();
  };

  const handleNextYear = () => {
    setSelectedYear((y) => y + 1);
    triggerSelection();
  };

  const handleSelectMonth = (m: number) => {
    triggerSelection();
    onSelect(m, selectedYear);
    onClose();
  };

  const handleSelectToday = () => {
    triggerSelection();
    onSelect(todayMonth, todayYear);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <Text style={styles.title}>בחירת חודש ושנה</Text>
            <TouchableOpacity
              onPress={handleSelectToday}
              style={styles.currentMonthBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="החודש הנוכחי"
            >
              <Text style={styles.currentMonthBtnText}>החודש הנוכחי</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.yearSwitcher}>
          <TouchableOpacity
            onPress={handlePrevYear}
            style={styles.yearArrowBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="שנה קודמת"
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.yearInfoContainer}>
            <Text style={styles.yearText}>{yearLabel}</Text>
            <Text style={styles.yearMetaText}>
              {isLeapYear ? 'שנה מעוברת (13 חודשים)' : 'שנה פשוטה (12 חודשים)'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextYear}
            style={styles.yearArrowBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="שנה הבאה"
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.monthsGrid}>
          {months.map(({ num, name }) => {
            const isMonthActive =
              num === currentMonth && selectedYear === currentYear;
            const isToday =
              num === todayMonth && selectedYear === todayYear;
            const tractate = yearTractates.get(num);

            return (
              <TouchableOpacity
                key={num}
                onPress={() => handleSelectMonth(num)}
                style={[
                  styles.monthCard,
                  isToday && !isMonthActive && styles.monthCardToday,
                  isMonthActive && styles.monthCardActive,
                ]}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${name} ${yearLabel}`}
              >
                <Text
                  style={[
                    styles.monthName,
                    isMonthActive && styles.monthNameActive,
                  ]}
                >
                  {name}
                </Text>
                {tractate ? (
                  <Text
                    style={[
                      styles.monthTractate,
                      isMonthActive && styles.monthTractateActive,
                    ]}
                    numberOfLines={1}
                  >
                    {tractate}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </BottomSheetModal>
  );
}
