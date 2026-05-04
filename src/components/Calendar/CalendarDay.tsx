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
      activeOpacity={0.7}
      className="w-[14.28%] h-14 justify-center items-center my-1"
    >
      <View className={`
        w-12 h-12 rounded-2xl justify-center items-center
        ${learned ? 'bg-green-500 shadow-md shadow-green-200' : ''}
        ${isToday && !learned ? 'bg-blue-50 border-2 border-blue-500' : ''}
        ${isSelected && !learned && !isToday ? 'bg-slate-100 border border-slate-300' : ''}
        ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
      `}>
        <Text className={`
          text-base font-bold
          ${learned ? 'text-white' : 'text-slate-800'}
          ${isToday && !learned ? 'text-blue-600' : ''}
        `}>
          {gematriya}
        </Text>
        <Text className={`
          text-[9px] font-medium -mt-1
          ${learned ? 'text-green-100' : 'text-slate-400'}
          ${isToday && !learned ? 'text-blue-400' : ''}
        `}>
          {gregDay}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CalendarDay;
