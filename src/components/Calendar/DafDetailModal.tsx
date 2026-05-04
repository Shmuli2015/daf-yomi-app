import React from 'react';
import { View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SelectedDafCard from './SelectedDafCard';

interface DafDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: HDate | null;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
    sefariaUrl: string;
  } | null;
  isLearned: boolean;
  onToggle: () => void;
}

const DafDetailModal = ({ 
  visible, 
  onClose, 
  selectedDate, 
  dafInfo, 
  isLearned, 
  onToggle 
}: DafDetailModalProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1">
        <Pressable 
          className="flex-1 bg-slate-900/60"
          onPress={onClose}
        />
        <View 
          style={{ paddingBottom: insets.bottom + 24 }}
          className="bg-white rounded-t-[50px] p-8 shadow-2xl absolute bottom-0 left-0 right-0"
        >
          {/* Handle */}
          <View className="w-16 h-1.5 bg-slate-100 rounded-full self-center mb-8" />
          
          {/* Close Button */}
          <TouchableOpacity 
            onPress={onClose}
            className="absolute right-8 top-8 z-10 bg-slate-50 p-2 rounded-full"
          >
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>

          {selectedDate && dafInfo && (
            <SelectedDafCard 
              selectedDate={selectedDate}
              dafInfo={dafInfo}
              isLearned={isLearned}
              onToggle={onToggle}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DafDetailModal;
