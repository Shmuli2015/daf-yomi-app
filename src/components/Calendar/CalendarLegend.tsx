import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LegendItem = ({ 
  label, 
  description, 
  icon, 
  iconColor, 
  bgColor 
}: { 
  label: string, 
  description: string, 
  icon: keyof typeof Ionicons.glyphMap, 
  iconColor: string, 
  bgColor: string 
}) => (
  <View className={`flex-row-reverse items-center p-4 rounded-[24px] ${bgColor} mb-3 border border-white/50 shadow-sm shadow-slate-100`}>
    <View className="bg-white/80 p-2.5 rounded-2xl shadow-sm">
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View className="mr-4 flex-1 items-end">
      <Text className="text-slate-900 font-black text-base">{label}</Text>
      <Text className="text-slate-500 text-xs font-bold">{description}</Text>
    </View>
  </View>
);

const CalendarLegend = () => {
  return (
    <View className="mt-10 px-4">
      <View className="flex-row-reverse items-center mb-6">
        <View className="w-1.5 h-6 bg-blue-500 rounded-full ml-3" />
        <Text className="text-2xl font-black text-slate-900 text-right">סטטוס לימוד</Text>
      </View>
      
      <View className="space-y-1">
        <LegendItem 
          label="דף שנלמד" 
          description="דף שסומן כנלמד במערכת" 
          icon="checkmark-circle" 
          iconColor="#22c55e" 
          bgColor="bg-green-50" 
        />
        <LegendItem 
          label="הספק היום" 
          description="הלימוד המיועד להיום" 
          icon="calendar" 
          iconColor="#3b82f6" 
          bgColor="bg-blue-50" 
        />
        <LegendItem 
          label="טרם הושלם" 
          description="דפים הממתינים ללימוד" 
          icon="time-outline" 
          iconColor="#94a3b8" 
          bgColor="bg-slate-50" 
        />
      </View>
    </View>
  );
};

export default CalendarLegend;
