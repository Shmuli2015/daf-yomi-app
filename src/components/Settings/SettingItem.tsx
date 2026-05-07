import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  value?: string | boolean;
  onPress?: (value?: any) => void;
  type?: 'switch' | 'arrow' | 'none';
  isDestructive?: boolean;
}

export const SettingItem = ({ icon, title, description, value, onPress, type = 'arrow', isDestructive = false }: SettingItemProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={type === 'switch' && !onPress}
      className={`flex-row-reverse items-center justify-between px-4 py-3.5 bg-white border-b border-slate-50 ${type === 'arrow' ? 'active:bg-slate-50' : ''}`}
    >
      <View className="flex-row-reverse items-center flex-1">
        <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDestructive ? 'bg-red-50' : 'bg-indigo-50'}`}>
          <Ionicons name={icon} size={20} color={isDestructive ? '#ef4444' : '#6366f1'} />
        </View>
        <View className="mr-3.5 items-end">
          <Text className={`text-[16px] font-semibold ${isDestructive ? 'text-red-600' : 'text-slate-800'}`}>{title}</Text>
          {description && <Text className="text-[13px] text-slate-400 mt-0.5 leading-4">{description}</Text>}
        </View>
      </View>
      
      <View className="flex-row items-center justify-end">
        {type === 'switch' ? (
          <Switch 
            value={value as boolean} 
            onValueChange={onPress as any}
            trackColor={{ false: '#f1f5f9', true: '#c7d2fe' }}
            thumbColor={value ? '#6366f1' : '#ffffff'}
            ios_backgroundColor="#f1f5f9"
          />
        ) : type === 'arrow' ? (
          <View className="flex-row items-center">
            {value && (
              <Text className="text-[15px] text-slate-400 font-normal mr-2" numberOfLines={1}>
                {value}
              </Text>
            )}
            <Ionicons name="chevron-back" size={16} color="#cbd5e1" />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
