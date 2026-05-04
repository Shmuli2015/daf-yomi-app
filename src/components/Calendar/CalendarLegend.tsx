import React from 'react';
import { View, Text } from 'react-native';

const LegendItem = ({ label, description, colorClass, dotColor, border }: { label: string, description: string, colorClass: string, dotColor: string, border?: boolean }) => (
  <View className={`flex-1 min-w-[100px] p-4 rounded-3xl ${colorClass} ${border ? 'border border-slate-100' : ''}`}>
    <View className="flex-row justify-end items-center mb-2">
      <Text className="text-slate-800 font-bold text-sm mr-2">{label}</Text>
      <View className={`w-2 h-2 rounded-full ${dotColor}`} />
    </View>
    <Text className="text-slate-500 text-[10px] text-right leading-tight">{description}</Text>
  </View>
);

const CalendarLegend = () => {
  return (
    <View className="mt-8 px-2">
      <Text className="text-xl font-bold text-slate-800 text-right mb-4 px-2">מקרא</Text>
      <View className="flex-row-reverse flex-wrap gap-3">
        <LegendItem 
          label="הושלם" 
          description="דף שנלמד במועדו" 
          colorClass="bg-green-50" 
          dotColor="bg-green-500" 
        />
        <LegendItem 
          label="היום" 
          description="התאריך הנוכחי" 
          colorClass="bg-blue-50" 
          dotColor="bg-blue-500" 
        />
        <LegendItem 
          label="לא הושלם" 
          description="טרם סומן כנלמד" 
          colorClass="bg-white" 
          dotColor="bg-slate-300" 
          border
        />
      </View>
    </View>
  );
};

export default CalendarLegend;
