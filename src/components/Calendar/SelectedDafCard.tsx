import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';

interface SelectedDafCardProps {
  selectedDate: HDate;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
    sefariaUrl: string;
  };
  isLearned: boolean;
  onToggle?: () => void;
}

const SelectedDafCard = ({ selectedDate, dafInfo, isLearned, onToggle }: SelectedDafCardProps) => {
  const isFuture = dafInfo.dateString > new Date().toISOString().split('T')[0];

  const handleOpenSefaria = () => {
    Linking.openURL(dafInfo.sefariaUrl);
  };

  return (
    <View className="bg-white rounded-[40px]">
      {/* Header with Date */}
      <View className="flex-row-reverse justify-between items-center mb-8">
        <View className="bg-blue-50 px-4 py-2 rounded-2xl">
          <Text className="text-blue-600 text-xs font-black tracking-widest uppercase">סדר הלימוד</Text>
        </View>
        <View className="items-end">
            <Text className="text-slate-900 font-black text-lg">
                {selectedDate.renderGematriya().replace(/[\u0591-\u05C7]/g, '')}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {new Date(dafInfo.dateString).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
        </View>
      </View>

      {/* Main Info */}
      <View className="items-center py-10 bg-slate-50 rounded-[32px] mb-8 border border-slate-100">
        <Text className="text-5xl font-black text-slate-900 mb-2">{dafInfo.masechet}</Text>
        <View className="flex-row items-center">
            <View className="h-px w-8 bg-blue-200 mx-3" />
            <Text className="text-2xl font-bold text-blue-500">{dafInfo.daf}</Text>
            <View className="h-px w-8 bg-blue-200 mx-3" />
        </View>
      </View>
      
      {/* Action Buttons */}
      <View className="space-y-4">
          <TouchableOpacity 
            onPress={onToggle}
            activeOpacity={0.8}
            className={`py-5 rounded-2xl flex-row-reverse justify-center items-center shadow-xl ${
              isLearned ? 'bg-green-500 shadow-green-200' : isFuture ? 'bg-amber-500 shadow-amber-200' : 'bg-blue-600 shadow-blue-200'
            }`}
          >
            {isLearned ? (
              <Ionicons name="checkmark-done-circle" size={24} color="white" className="ml-3" />
            ) : (
              <Ionicons name="book" size={22} color="white" className="ml-3" />
            )}
            <Text className="text-lg font-black text-white">
              {isLearned ? 'סיום הדף!' : isFuture ? 'למדתי מראש' : 'סמן כנלמד'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenSefaria}
            activeOpacity={0.7}
            className="py-4 border-2 border-slate-100 rounded-2xl flex-row-reverse justify-center items-center mt-3"
          >
            <Ionicons name="open-outline" size={20} color="#64748b" className="ml-2" />
            <Text className="text-slate-600 font-bold text-base">פתח בספריא (Sefaria)</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectedDafCard;
