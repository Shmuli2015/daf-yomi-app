import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';

interface HomeContentProps {
  isLearned: boolean;
  handleToggle: () => void;
  streak: number;
  last7Days: any[];
}

export default function HomeContent({ 
  isLearned, 
  handleToggle, 
  streak, 
  last7Days 
}: HomeContentProps) {
  return (
    <View className="px-6 -mt-8">
      {/* Main Action Button */}
      <TouchableOpacity 
        onPress={handleToggle}
        activeOpacity={0.8}
        className={`rounded-3xl py-6 px-8 items-center justify-center shadow-xl ${
          isLearned ? 'bg-green-600' : 'bg-blue-600'
        }`}
      >
        <View className="flex-row items-center">
          <Text className="text-white text-2xl font-black">
            {isLearned ? '✓ הושלם בהצלחה' : 'סיימתי את הדף!'}
          </Text>
        </View>
        {isLearned && (
          <Text className="text-green-100 text-xs mt-1 opacity-70">לחץ לביטול הסימון</Text>
        )}
      </TouchableOpacity>

      {/* Stats Row */}
      <View className="flex-row justify-between mt-8">
        <View className="bg-orange-50 p-6 rounded-[32px] flex-1 mr-2 items-center border border-orange-100">
          <Text className="text-orange-900/60 font-bold mb-1">רצף נוכחי</Text>
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-black text-orange-600">{streak}</Text>
            <Text className="text-orange-600 ml-1 text-lg">🔥</Text>
          </View>
        </View>
        
        <View className="bg-blue-50 p-6 rounded-[32px] flex-1 ml-2 items-center border border-blue-100">
          <Text className="text-blue-900/60 font-bold mb-1">סטטוס</Text>
          <Text className={`text-xl font-black ${isLearned ? 'text-green-600' : 'text-blue-400'}`}>
            {isLearned ? 'נלמד' : 'ממתין'}
          </Text>
        </View>
      </View>

      {/* 7 Day History */}
      <View className="mt-10 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity>
            <Text className="text-blue-600 font-bold text-sm">הצג הכל ←</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 font-black text-lg">מעקב שבועי</Text>
        </View>
        
        <View className="flex-row justify-between">
          {last7Days.map((day, idx) => (
            <View key={idx} className="items-center">
              <View 
                className={`w-11 h-11 rounded-2xl items-center justify-center mb-2 shadow-sm ${
                  day.status === 'learned' ? 'bg-green-500' : 'bg-white'
                }`}
              >
                {day.status === 'learned' ? (
                   <Text className="text-white font-bold text-lg">✓</Text>
                ) : (
                   <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </View>
              <Text className={`text-[10px] font-bold ${idx === 6 ? 'text-blue-600' : 'text-gray-400'}`}>
                {idx === 6 ? 'היום' : format(day.date, 'd/M')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Motivational Message */}
      {!isLearned && (
        <View className="mt-10 items-center p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
          <Text className="text-yellow-800 font-bold text-center">
            "כל המקיים את התורה מעוני, סופו לקיימה מעושר"
          </Text>
          <Text className="text-yellow-700/60 text-xs mt-1">אבות ד׳, ט׳</Text>
        </View>
      )}
    </View>
  );
}
