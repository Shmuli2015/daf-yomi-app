import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
  sefariaUrl: string;
}

export default function HomeHeader({ 
  gregorianDateStr, 
  hebrewDateStr, 
  todayMasechet, 
  todayDafNum,
  sefariaUrl
}: HomeHeaderProps) {
  // Strip niqqud (vowels) from Hebrew date string
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  return (
    <View className="bg-[#fdfdfb] pt-14 pb-14 px-6 rounded-b-[60px] shadow-2xl border-b-4 border-[#f3f4f6] relative overflow-hidden">
      {/* Decorative Background Pattern (simulated) */}
      <View className="absolute top-0 right-0 opacity-[0.03]">
        <Text className="text-[120px] font-black -mr-10 -mt-10 rotate-12 text-[#b45309]">גמרא</Text>
      </View>

      <View className="flex-row justify-between items-center mb-10">
        <View className="bg-gray-100/80 px-4 py-2 rounded-2xl">
          <Text className="text-gray-400 text-[10px] font-black tracking-[1.5px] uppercase">{gregorianDateStr}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[#1e293b] text-2xl font-black tracking-tighter">{cleanHebrewDate}</Text>
          <View className="h-1 w-10 bg-[#b45309] rounded-full mt-1.5 shadow-sm" />
        </View>
      </View>

      <View className="items-center">
        <View className="flex-row items-center mb-4">
          <View className="h-[1px] w-10 bg-[#b45309]/15" />
          <Text className="mx-4 text-[#b45309]/60 text-[11px] font-black tracking-[3px] uppercase">סדר הלימוד היומי</Text>
          <View className="h-[1px] w-10 bg-[#b45309]/15" />
        </View>
        
        <View className="bg-white px-10 py-7 rounded-[48px] shadow-xl border border-gray-50 items-center w-full">
          <Text className="text-[42px] font-black text-[#1e293b] text-center leading-tight mb-2">
            {todayMasechet}
          </Text>
          
          <View className="bg-[#1e293b] px-8 py-2.5 rounded-full shadow-lg border-2 border-[#b45309]/30">
            <Text className="text-white text-2xl font-black tracking-tight">{todayDafNum}</Text>
          </View>

          <TouchableOpacity 
            onPress={() => Linking.openURL(sefariaUrl)}
            className="mt-8 flex-row items-center bg-[#f8fafc] px-6 py-3 rounded-2xl border border-gray-100"
          >
            <Text className="text-[#64748b] text-sm font-bold mr-2">ללימוד בספריא</Text>
            <Text className="text-[#b45309] text-lg font-black">📖</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
