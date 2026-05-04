import React from 'react';
import { View, Text } from 'react-native';
import { HDate } from '@hebcal/core';

interface SelectedDafCardProps {
  selectedDate: HDate;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
  };
  isLearned: boolean;
}

const SelectedDafCard = ({ selectedDate, dafInfo, isLearned }: SelectedDafCardProps) => {
  const isFuture = dafInfo.dateString > new Date().toISOString().split('T')[0];

  return (
    <View className="mt-6 bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl shadow-slate-100">
      <View className="flex-row-reverse justify-between items-center mb-6">
        <View className="bg-amber-50 px-3 py-1.5 rounded-xl">
          <Text className="text-amber-700 text-xs font-black">דף היומי</Text>
        </View>
        <Text className="text-slate-500 font-bold text-sm">
          {selectedDate.render('he').replace(/[\u0591-\u05C7]/g, '')}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-3xl font-black text-slate-900 mb-1">{dafInfo.masechet}</Text>
        <Text className="text-xl font-bold text-blue-500">{dafInfo.daf}</Text>
      </View>
      
      <View className={`mt-6 py-3 rounded-2xl items-center ${
        isLearned ? 'bg-green-50' : isFuture ? 'bg-slate-50' : 'bg-red-50'
      }`}>
        <Text className={`text-sm font-bold ${
          isLearned ? 'text-green-700' : isFuture ? 'text-slate-600' : 'text-red-700'
        }`}>
          {isFuture ? 'טרם הגיע הזמן' : isLearned ? '✓ נלמד בהצלחה' : '⚠ עדיין לא נלמד'}
        </Text>
      </View>
    </View>
  );
};

export default SelectedDafCard;
