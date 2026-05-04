import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { HDate, Locale } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { getDafByDate } from '../utils/dafYomi';
import CalendarDay from './Calendar/CalendarDay';
import SelectedDafCard from './Calendar/SelectedDafCard';

const DAYS_OF_WEEK = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

interface DayData {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  isToday: boolean;
  dateKey: string;
}

export default function HebrewCalendar() {
  const { history } = useAppStore();
  const [currentHDate, setCurrentHDate] = useState(new HDate());
  const [selectedDate, setSelectedDate] = useState<HDate | null>(new HDate());

  const calendarData = useMemo(() => {
    const year = currentHDate.getFullYear();
    const month = currentHDate.getMonth();
    
    const firstDayOfMonth = new HDate(1, month, year);
    const dayOfWeek = firstDayOfMonth.getDay();
    
    const days: DayData[] = [];
    
    const prevMonth = firstDayOfMonth.prev();
    const prevMonthDaysCount = dayOfWeek;
    for (let i = prevMonthDaysCount - 1; i >= 0; i--) {
      const d = new HDate(prevMonth.getDate() - i, prevMonth.getMonth(), prevMonth.getFullYear());
      days.push({
        hdate: d,
        isCurrentMonth: false,
        learned: isLearned(d),
        isToday: isSameDay(d, new HDate()),
        dateKey: d.greg().toISOString().split('T')[0]
      });
    }
    
    let d = firstDayOfMonth;
    while (d.getMonth() === month) {
      days.push({
        hdate: d,
        isCurrentMonth: true,
        learned: isLearned(d),
        isToday: isSameDay(d, new HDate()),
        dateKey: d.greg().toISOString().split('T')[0]
      });
      d = d.next();
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({
            hdate: d,
            isCurrentMonth: false,
            learned: isLearned(d),
            isToday: isSameDay(d, new HDate()),
            dateKey: d.greg().toISOString().split('T')[0]
        });
        d = d.next();
    }
    
    return days;
  }, [currentHDate, history]);

  function isLearned(hdate: HDate) {
    const dateStr = hdate.greg().toISOString().split('T')[0];
    return history.some(r => r.date === dateStr && r.status === 'learned');
  }

  function isSameDay(d1: HDate, d2: HDate | null) {
    if (!d2) return false;
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  }

  const nextMonth = () => {
    const daysInMonth = HDate.daysInMonth(currentHDate.getMonth(), currentHDate.getFullYear());
    const next = new HDate(daysInMonth, currentHDate.getMonth(), currentHDate.getFullYear()).next();
    setCurrentHDate(new HDate(1, next.getMonth(), next.getFullYear()));
  };

  const prevMonth = () => {
    const prev = new HDate(1, currentHDate.getMonth(), currentHDate.getFullYear()).prev();
    setCurrentHDate(new HDate(1, prev.getMonth(), prev.getFullYear()));
  };

  const monthName = Locale.gettext(HDate.getMonthName(currentHDate.getMonth(), currentHDate.getFullYear()), 'he').replace(/[\u0591-\u05C7]/g, '');
  const yearName = currentHDate.renderGematriya().split(' ').pop();

  const selectedDafInfo = useMemo(() => {
    if (!selectedDate) return null;
    return getDafByDate(selectedDate.greg());
  }, [selectedDate]);

  return (
    <View>
      <View className="bg-white rounded-[40px] p-6 border border-slate-100">
        {/* Month Navigator */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={nextMonth} className="p-3 bg-slate-50 rounded-2xl">
            <Ionicons name="chevron-back" size={20} color="#64748b" />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-2xl font-black text-slate-900">{monthName}</Text>
            <Text className="text-xs text-blue-500 font-bold uppercase tracking-widest">{yearName}</Text>
          </View>

          <TouchableOpacity onPress={prevMonth} className="p-3 bg-slate-50 rounded-2xl">
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View className="flex-row-reverse justify-around mb-4">
          {DAYS_OF_WEEK.map((day, index) => (
            <Text key={index} className="w-[14.28%] text-center text-[10px] font-black text-slate-400 uppercase">
              {day}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View className="flex-row-reverse flex-wrap">
          {calendarData.map((day, index) => (
            <CalendarDay 
              key={index}
              hdate={day.hdate}
              isCurrentMonth={day.isCurrentMonth}
              learned={day.learned}
              isToday={day.isToday}
              isSelected={isSameDay(day.hdate, selectedDate)}
              onPress={(hd) => setSelectedDate(hd)}
            />
          ))}
        </View>
      </View>

      {/* Selected Day Info */}
      {selectedDate && selectedDafInfo && (
        <SelectedDafCard 
          selectedDate={selectedDate}
          dafInfo={selectedDafInfo}
          isLearned={isLearned(selectedDate)}
        />
      )}
    </View>
  );
}

