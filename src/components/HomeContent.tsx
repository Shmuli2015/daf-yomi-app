import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface HomeContentProps {
  isLearned: boolean;
  handleToggle: () => void;
  streak: number;
}

export default function HomeContent({ 
  isLearned, 
  handleToggle, 
  streak 
}: HomeContentProps) {
  return (
    <View className="px-6 -mt-10">
      {/* Main Action Button */}
      <TouchableOpacity 
        onPress={handleToggle}
        activeOpacity={0.8}
        className={`rounded-2xl py-4 px-8 items-center justify-center shadow-sm ${
          isLearned 
            ? 'bg-green-50 border border-green-100' 
            : 'bg-[#1e293b]'
        }`}
      >
        <Text className={`text-lg font-black tracking-tight ${isLearned ? 'text-green-700' : 'text-white'}`}>
          {isLearned ? '✓ הושלם' : 'סיימתי את הדף!'}
        </Text>
        {isLearned && (
          <Text className="text-green-600/50 text-[9px] font-bold uppercase mt-0.5">לחץ לביטול</Text>
        )}
      </TouchableOpacity>

      {/* Stats Row */}
      <View className="flex-row justify-between mt-10">
        <View className="bg-white p-6 rounded-[32px] flex-1 mr-2 items-center shadow-sm border border-gray-100">
          <Text className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-wider">רצף נוכחי</Text>
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-black text-[#b45309]">{streak}</Text>
            <Text className="text-lg ml-1">🔥</Text>
          </View>
        </View>
        
        <View className="bg-white p-6 rounded-[32px] flex-1 ml-2 items-center shadow-sm border border-gray-100">
          <Text className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-wider">סטטוס</Text>
          <Text className={`text-xl font-black ${isLearned ? 'text-green-600' : 'text-blue-200'}`}>
            {isLearned ? 'נלמד' : 'לא נלמד'}
          </Text>
        </View>
      </View>


    </View>
  );
}
