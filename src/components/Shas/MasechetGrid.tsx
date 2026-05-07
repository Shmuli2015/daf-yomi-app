import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, numberToGematria } from '../../data/shas';
import { getMasechetProgress, getDafDateStr, isDafLearnedByDate, getMasechetDafim } from '../../utils/shas';

interface MasechetGridProps {}

export default function MasechetGrid({}: MasechetGridProps) {
  const { history } = useAppStore();
  const [selectedMasechet, setSelectedMasechet] = useState<typeof SHAS_MASECHTOT[0] | null>(null);

  return (
    <View className="px-6 py-4">
      <View className="flex-row-reverse items-center justify-between mb-4">
        <Text className="text-xl font-black text-gray-800 text-right">התקדמות בש״ס</Text>
      </View>
      
      <View className="flex-row-reverse flex-wrap justify-between">
        {SHAS_MASECHTOT.map((m) => {
          const total = getMasechetDafim(m.he).length;
          if (total === 0) return null;

          const learned = getMasechetProgress(m.he, history);
          const percent = Math.round((learned / total) * 100);
          const isCompleted = learned === total && total > 0;

          return (
            <TouchableOpacity
              key={m.en}
              activeOpacity={0.8}
              onPress={() => setSelectedMasechet(m)}
              className={`w-[48%] mb-4 p-4 rounded-2xl border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <Text className="text-lg font-bold text-gray-800 text-right mb-1">{m.he}</Text>
              <View className="flex-row-reverse justify-start items-center">
                <Text className="text-xs text-gray-500 font-medium text-right">
                  {learned} / {total} דפים
                </Text>
              </View>
              {/* Progress bar */}
              <View className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <View 
                  className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                  style={{ width: `${percent}%`, position: 'absolute', right: 0 }} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal for viewing Dafim in the selected Masechet */}
      {selectedMasechet && (
        <MasechetModal 
          masechet={selectedMasechet} 
          onClose={() => setSelectedMasechet(null)} 
        />
      )}
    </View>
  );
}

function MasechetModal({ masechet, onClose }: { masechet: typeof SHAS_MASECHTOT[0], onClose: () => void }) {
  const { history, toggleAnyDafLearned } = useAppStore();

  const handleToggleDaf = (dafNum: number) => {
    const dateStr = getDafDateStr(masechet.he, dafNum);
    if (!dateStr) return;
    
    const dafHeStr = `דף ${numberToGematria(dafNum)}`;
    toggleAnyDafLearned(dateStr, masechet.he, dafHeStr);
  };

  const dafimArray = getMasechetDafim(masechet.he);

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4 border-b border-gray-200 bg-white flex-row-reverse justify-between items-center">
          <Text className="text-xl font-black text-gray-800 text-right">מסכת {masechet.he}</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-blue-600 font-bold text-lg">סגור</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="flex-row-reverse flex-wrap justify-start" style={{ gap: 8 }}>
            {dafimArray.map(dafNum => {
              const dateStr = getDafDateStr(masechet.he, dafNum);
              const isLearned = dateStr ? isDafLearnedByDate(dateStr, history) : false;

              return (
                <TouchableOpacity
                  key={dafNum}
                  activeOpacity={0.7}
                  onPress={() => handleToggleDaf(dafNum)}
                  className={`w-[45px] h-[45px] items-center justify-center rounded-xl border ${
                    isLearned 
                      ? 'bg-green-100 border-green-300' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-base font-bold ${isLearned ? 'text-green-700' : 'text-gray-600'}`}>
                    {numberToGematria(dafNum)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
