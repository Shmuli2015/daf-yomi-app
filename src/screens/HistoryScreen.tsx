import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

export default function HistoryScreen() {
  const { history } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <FlatList
        data={history}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
            <View className={`px-3 py-1 rounded-full ${item.status === 'learned' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`${item.status === 'learned' ? 'text-green-700' : 'text-red-700'} font-bold`}>
                {item.status === 'learned' ? 'לומד' : 'לא סומן'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-sm">{item.date}</Text>
              <Text className="text-lg font-bold text-gray-800">{item.masechet} {item.daf}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400 text-lg">אין היסטוריה עדיין</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
