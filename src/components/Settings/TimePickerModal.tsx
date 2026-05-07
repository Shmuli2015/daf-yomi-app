import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
  setHour: (h: number) => void;
  setMinute: (m: number) => void;
  onSave: () => void;
}

export const TimePickerModal = ({ 
  visible, 
  onClose, 
  hour, 
  minute, 
  setHour, 
  setMinute, 
  onSave 
}: TimePickerModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable className="bg-white w-full rounded-3xl p-6 overflow-hidden shadow-2xl">
          <Text className="text-xl font-bold text-slate-800 text-center mb-6">בחר שעת התראה</Text>
          
          <View className="flex-row justify-center items-center mb-8">
            <View className="items-center mx-4">
              <TouchableOpacity onPress={() => setHour((hour + 1) % 24)} className="p-2 active:opacity-50">
                <Ionicons name="chevron-up" size={30} color="#6366f1" />
              </TouchableOpacity>
              <Text className="text-4xl font-bold text-indigo-600 my-2">{hour.toString().padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => setHour((hour + 23) % 24)} className="p-2 active:opacity-50">
                <Ionicons name="chevron-down" size={30} color="#6366f1" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-4xl font-bold text-slate-200">:</Text>
            
            <View className="items-center mx-4">
              <TouchableOpacity onPress={() => setMinute((minute + 5) % 60)} className="p-2 active:opacity-50">
                <Ionicons name="chevron-up" size={30} color="#6366f1" />
              </TouchableOpacity>
              <Text className="text-4xl font-bold text-indigo-600 my-2">{minute.toString().padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => setMinute((minute + 55) % 60)} className="p-2 active:opacity-50">
                <Ionicons name="chevron-down" size={30} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-indigo-600 py-4 rounded-2xl items-center shadow-lg shadow-indigo-200"
            onPress={onSave}
          >
            <Text className="text-white font-bold text-lg">שמור</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
