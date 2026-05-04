import React from 'react';
import { View, Text } from 'react-native';

const CalendarHeader = () => {
  return (
    <View className="mb-6 px-4">
      <Text className="text-4xl font-black text-slate-900 text-right mb-2">לוח שנה</Text>
      <View className="flex-row justify-end items-center">
        <Text className="text-slate-500 text-right mr-2">מעקב למידה לפי תאריך עברי</Text>
        <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      </View>
    </View>
  );
};

export default CalendarHeader;
