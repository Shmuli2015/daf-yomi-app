import React from 'react';
import { View, Text } from 'react-native';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
}

export default function HomeHeader({ 
  gregorianDateStr, 
  hebrewDateStr, 
  todayMasechet, 
  todayDafNum 
}: HomeHeaderProps) {
  // Strip niqqud (vowels) from Hebrew date string
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  return (
    <View className="bg-[#fdfdfb] pt-14 pb-12 px-6 rounded-b-[50px] shadow-md border-b-4 border-[#e5e7eb]">
      <View className="flex-row justify-between items-center mb-10">
        <View className="bg-gray-100/50 px-3 py-1.5 rounded-xl">
          <Text className="text-gray-400 text-[10px] font-bold tracking-[1px] uppercase">{gregorianDateStr}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[#1e293b] text-xl font-black tracking-tight">{cleanHebrewDate}</Text>
          <View className="h-0.5 w-8 bg-[#b45309] rounded-full mt-1" />
        </View>
      </View>

      <View className="items-center">
        <View className="flex-row items-center mb-3">
          <View className="h-[1px] w-6 bg-[#b45309]/20" />
          <Text className="mx-3 text-[#b45309] text-[10px] font-black tracking-[2px] uppercase">סדר הלימוד היומי</Text>
          <View className="h-[1px] w-6 bg-[#b45309]/20" />
        </View>
        
        <View className="bg-white px-8 py-4 rounded-[32px] shadow-sm border border-gray-100 items-center w-full">
          <Text className="text-4xl font-black text-[#1e293b] text-center mb-1">
            {todayMasechet}
          </Text>
          
          <View className="mt-4 flex-row items-center">
             <View className="bg-[#1e293b] px-6 py-2 rounded-full shadow-lg border-2 border-[#b45309]/30">
                <Text className="text-white text-xl font-black">{todayDafNum}</Text>
             </View>
          </View>
        </View>
      </View>
    </View>
  );
}
