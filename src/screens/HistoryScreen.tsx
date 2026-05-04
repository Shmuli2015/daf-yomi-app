import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { HDate } from '@hebcal/core';

export default function HistoryScreen() {
  const { history } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <FlatList
        data={history}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          // Since item.date is YYYY-MM-DD, new Date(item.date) is UTC midnight
          const hdate = new HDate(new Date(item.date));
          return (
            <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
              <View className={`px-3 py-1 rounded-full ${item.status === 'learned' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`${item.status === 'learned' ? 'text-green-700' : 'text-red-700'} font-bold`}>
                  {item.status === 'learned' ? 'נלמד' : 'לא סומן'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-400 text-[10px] font-bold">{item.date}</Text>
                <Text className="text-blue-600 text-xs font-bold mb-1">{hdate.renderGematriya()}</Text>
                <Text className="text-lg font-black text-gray-800">{item.masechet} {item.daf}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400 text-lg">אין היסטוריה עדיין</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
