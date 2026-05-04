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
            activeOpacity={0.9}
            className={`py-6 rounded-[28px] flex-row-reverse justify-center items-center shadow-2xl ${
              isLearned ? 'bg-green-500 shadow-green-300' : isFuture ? 'bg-amber-500 shadow-amber-300' : 'bg-blue-600 shadow-blue-300'
            }`}
          >
            <View className="bg-white/20 p-2 rounded-full ml-4">
                <Ionicons 
                    name={isLearned ? "checkmark-done" : isFuture ? "calendar" : "book"} 
                    size={22} 
                    color="white" 
                />
            </View>
            <Text className="text-xl font-black text-white tracking-tight">
              {isLearned ? 'אשריך! סיימת' : isFuture ? 'למדתי מראש' : 'סמן כנלמד'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenSefaria}
            activeOpacity={0.7}
            className="py-5 bg-slate-50 border border-slate-100 rounded-[28px] flex-row-reverse justify-center items-center mt-4"
          >
            <View className="bg-white p-2 rounded-full shadow-sm ml-3 border border-slate-100">
                <Ionicons name="open-outline" size={18} color="#3b82f6" />
            </View>
            <Text className="text-slate-700 font-black text-lg tracking-tight">פתח בספריא (Sefaria)</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectedDafCard;
