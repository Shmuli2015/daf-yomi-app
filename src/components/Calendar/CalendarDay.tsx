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
      className="w-[14.28%] h-16 justify-center items-center"
    >
      <View className={`
        w-11 h-11 rounded-2xl justify-center items-center
        ${learned ? 'bg-green-500 shadow-lg shadow-green-200' : ''}
        ${isToday && !learned ? 'bg-blue-600 shadow-lg shadow-blue-200' : ''}
        ${isSelected && !learned && !isToday ? 'bg-slate-100 border-2 border-slate-200' : ''}
        ${!learned && !isToday && !isSelected ? 'bg-transparent' : ''}
        ${!isCurrentMonth ? 'opacity-10' : 'opacity-100'}
      `}>
        <Text className={`
          text-base font-black
          ${learned || (isToday && !learned) ? 'text-white' : 'text-slate-800'}
        `}>
          {gematriya}
        </Text>
        <Text className={`
          text-[8px] font-bold -mt-0.5
          ${learned || (isToday && !learned) ? 'text-white/70' : 'text-slate-400'}
        `}>
          {gregDay}
        </Text>
        
        {/* Selection Indicator Dot if not today/learned */}
        {isSelected && !learned && !isToday && (
          <View className="absolute -bottom-1 w-1.5 h-1.5 bg-slate-400 rounded-full" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CalendarDay;
