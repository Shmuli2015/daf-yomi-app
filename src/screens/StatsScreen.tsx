import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export default function StatsScreen() {
  const { history, streak } = useAppStore();

  const stats = useMemo(() => {
    const totalDays = history.length;
    const learnedDays = history.filter(r => r.status === 'learned').length;
    
    // Monthly stats
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyHistory = history.filter(r => r.date.startsWith(currentMonth));
    const monthlyLearned = monthlyHistory.filter(r => r.status === 'learned').length;
    const monthlyTotal = monthlyHistory.length;
    const monthlyPercentage = monthlyTotal > 0 ? Math.round((monthlyLearned / monthlyTotal) * 100) : 0;

    // 30 days stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];
    const thirtyDaysHistory = history.filter(r => r.date >= thirtyDaysStr);
    const thirtyDaysLearned = thirtyDaysHistory.filter(r => r.status === 'learned').length;
    const thirtyDaysPercentage = thirtyDaysHistory.length > 0 ? Math.round((thirtyDaysLearned / thirtyDaysHistory.length) * 100) : 0;

    return {
      totalLearned: learnedDays,
      monthlyPercentage,
      thirtyDaysPercentage
    };
  }, [history]);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-5">
      <View className="bg-white p-6 rounded-2xl items-center shadow-sm border border-gray-100 mb-6">
        <Text className="text-gray-500 mb-2">רצף נוכחי</Text>
        <Text className="text-5xl font-bold text-orange-500">🔥 {streak}</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-white p-5 rounded-2xl flex-1 mr-2 items-center shadow-sm border border-gray-100">
          <Text className="text-gray-500 text-center mb-1">החודש</Text>
          <Text className="text-3xl font-bold text-blue-600">{stats.monthlyPercentage}%</Text>
        </View>
        <View className="bg-white p-5 rounded-2xl flex-1 ml-2 items-center shadow-sm border border-gray-100">
          <Text className="text-gray-500 text-center mb-1">30 ימים</Text>
          <Text className="text-3xl font-bold text-purple-600">{stats.thirtyDaysPercentage}%</Text>
        </View>
      </View>

      <View className="bg-white p-6 rounded-2xl items-center shadow-sm border border-gray-100">
        <Text className="text-gray-500 mb-2">סה"כ דפים שנלמדו</Text>
        <Text className="text-4xl font-bold text-green-600">{stats.totalLearned}</Text>
      </View>
    </ScrollView>
  );
}
