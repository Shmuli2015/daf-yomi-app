import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { HDate } from '@hebcal/core';
import { format, subDays } from 'date-fns';

export default function HomeScreen() {
  const { 
    currentDate, 
    todayRecord, 
    todayMasechet, 
    todayDafNum, 
    streak, 
    markTodayAsLearned, 
    history 
  } = useAppStore();

  const isLearned = todayRecord?.status === 'learned';
  const hDate = new HDate(currentDate);
  const hebrewDateStr = hDate.renderGematriya(); // Returns something like "ד׳ בְּאִיָּיר תשפ״ו"
  const gregorianDateStr = format(currentDate, 'dd/MM/yyyy');

  // Calculate last 7 days status
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(currentDate, 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const record = history.find(r => r.date === dateStr);
    return {
      date: d,
      dateStr,
      status: record?.status || 'missed',
      dayName: format(d, 'EEEEEE') // Short day name
    };
  });

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 20 }}>
      <View className="items-center mt-10 mb-8">
        <Text className="text-xl text-gray-500 font-semibold">{gregorianDateStr}</Text>
        <Text className="text-2xl font-bold text-gray-800 mt-1">{hebrewDateStr}</Text>
      </View>

      <View className="bg-white rounded-3xl p-8 shadow-sm items-center mb-8 border border-gray-100">
        <Text className="text-gray-500 text-lg mb-2">היום בדף היומי</Text>
        <Text className="text-4xl font-extrabold text-blue-900 text-center">{todayMasechet}</Text>
        <Text className="text-3xl font-bold text-blue-700 mt-2">{todayDafNum}</Text>
      </View>

      <TouchableOpacity 
        onPress={markTodayAsLearned}
        disabled={isLearned}
        className={`rounded-full py-5 px-8 items-center justify-center mb-10 shadow-md ${
          isLearned ? 'bg-green-700' : 'bg-green-500'
        }`}
      >
        <Text className="text-white text-2xl font-bold">
          {isLearned ? '✓ למדתי היום' : 'סימנתי שלמדתי היום'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-between mb-8">
        <View className="bg-white p-5 rounded-2xl flex-1 mr-2 items-center shadow-sm border border-gray-100">
          <Text className="text-gray-500 mb-1">רצף נוכחי</Text>
          <Text className="text-3xl font-bold text-orange-500">🔥 {streak}</Text>
        </View>
        <View className="bg-white p-5 rounded-2xl flex-1 ml-2 items-center shadow-sm border border-gray-100">
          <Text className="text-gray-500 mb-1">סטטוס היום</Text>
          <Text className={`text-xl font-bold ${isLearned ? 'text-green-600' : 'text-gray-400'}`}>
            {isLearned ? 'הושלם' : 'לא סומן'}
          </Text>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-bold text-lg mb-4 text-right">7 ימים אחרונים</Text>
        <View className="flex-row justify-between">
          {last7Days.map((day, idx) => (
            <View key={idx} className="items-center">
              <View 
                className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${
                  day.status === 'learned' ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                {day.status === 'learned' ? (
                   <Text className="text-white font-bold">✓</Text>
                ) : (
                   <Text className="text-gray-400">-</Text>
                )}
              </View>
              <Text className="text-xs text-gray-500">{day.date.getDate()}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
