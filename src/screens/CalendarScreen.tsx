import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HebrewCalendar from '../components/HebrewCalendar';
import CalendarHeader from '../components/Calendar/CalendarHeader';
import CalendarLegend from '../components/Calendar/CalendarLegend';

export default function CalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <CalendarHeader />
        
        <View className="shadow-2xl shadow-slate-200">
          <HebrewCalendar />
        </View>

        <CalendarLegend />
        
      </ScrollView>
    </SafeAreaView>
  );
}
