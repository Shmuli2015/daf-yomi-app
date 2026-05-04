import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { HDate } from '@hebcal/core';

interface CalendarDayProps {
  hdate: HDate;
  isCurrentMonth: boolean;
  learned: boolean;
  isToday: boolean;
  isSelected: boolean;
  onPress: (hdate: HDate) => void;
}

const CalendarDay = ({ hdate, isCurrentMonth, learned, isToday, isSelected, onPress }: CalendarDayProps) => {
  const gematriya = hdate.renderGematriya().split(' ')[0];
  const gregDay = hdate.greg().getDate();

  return (
    <TouchableOpacity 
      onPress={() => onPress(hdate)}
      activeOpacity={0.6}
      className="w-[14.28%] h-14 justify-center items-center my-1"
    >
      <View className={`
        w-11 h-11 rounded-full justify-center items-center
        ${learned ? 'bg-green-500' : isToday ? 'bg-blue-100' : 'bg-transparent'}
        ${isSelected ? 'border-2 border-slate-600 shadow-sm' : 'border-2 border-transparent'}
        ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
      `}>
        <Text className={`
          text-base font-bold
          ${learned ? 'text-white' : isToday ? 'text-blue-700' : 'text-slate-700'}
        `}>
          {gematriya}
        </Text>
        <Text className={`
          text-[9px] font-medium -mt-0.5
          ${learned ? 'text-green-100' : isToday ? 'text-blue-400' : 'text-slate-400'}
        `}>
          {gregDay}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CalendarDay;
