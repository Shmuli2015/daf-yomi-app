import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MasechetGrid from '../components/Shas/MasechetGrid';

export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <MasechetGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
