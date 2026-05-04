import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAppStore } from '../store/useAppStore';

export default function CalendarScreen() {
  const { history } = useAppStore();

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    history.forEach(record => {
      if (record.status === 'learned') {
        marks[record.date] = {
          selected: true,
          selectedColor: '#22c55e', // text-green-500
        };
      }
    });
    return marks;
  }, [history]);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <Calendar
          markedDates={markedDates}
          theme={{
            todayTextColor: '#3b82f6',
            arrowColor: '#3b82f6',
          }}
        />
      </View>
      <View className="mt-8 px-4">
        <Text className="text-xl font-bold text-gray-800 text-right mb-4">מקרא</Text>
        <View className="flex-row items-center justify-end mb-2">
          <Text className="text-gray-600 mr-3">למדתי</Text>
          <View className="w-5 h-5 rounded-full bg-green-500" />
        </View>
        <View className="flex-row items-center justify-end">
          <Text className="text-gray-600 mr-3">לא למדתי</Text>
          <View className="w-5 h-5 rounded-full bg-white border border-gray-300" />
        </View>
      </View>
    </View>
  );
}
