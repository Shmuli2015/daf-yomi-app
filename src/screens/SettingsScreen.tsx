import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import * as Notifications from 'expo-notifications';
import { resetDB } from '../db/database';

export default function SettingsScreen() {
  const { settings, updateNotificationSettings, loadInitialData } = useAppStore();
  const [shabbatEnabled, setShabbatEnabled] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShabbatEnabled(settings.enable_shabbat_notifications === 1);
    }
  }, [settings]);

  const saveSettings = async (newHour: number, newMin: number, newShabbat: boolean) => {
    updateNotificationSettings(newHour, newMin, newShabbat);
    
    // Schedule notification
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🕯️ הגיע זמן הדף היומי",
        body: "אל תשכח לסמן את הלימוד של היום!",
      },
      trigger: {
        hour: newHour,
        minute: newMin,
        repeats: true,
      } as any, // expo-notifications types vary slightly
    });
    Alert.alert("הגדרות נשמרו", "התראות עודכנו בהצלחה");
  };

  const handleReset = () => {
    Alert.alert(
      "מחיקת נתונים",
      "האם אתה בטוח שברצונך למחוק את כל הנתונים?",
      [
        { text: "ביטול", style: "cancel" },
        { 
          text: "מחק", 
          style: "destructive", 
          onPress: () => {
            resetDB();
            loadInitialData();
            Alert.alert("נמחק", "הנתונים נמחקו בהצלחה");
          } 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-5">
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <Text className="text-xl font-bold mb-4 text-right">התראות</Text>
        
        <View className="flex-row justify-between items-center mb-4">
          <Switch 
            value={shabbatEnabled} 
            onValueChange={(val) => {
              setShabbatEnabled(val);
              saveSettings(hour, minute, val);
            }} 
          />
          <Text className="text-gray-700 text-lg">התראות בשבת</Text>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-gray-100">
          <TouchableOpacity 
            className="bg-blue-100 px-4 py-2 rounded-lg"
            onPress={() => {
              // Basic hour increment for MVP
              const nextHour = (hour + 1) % 24;
              setHour(nextHour);
              saveSettings(nextHour, minute, shabbatEnabled);
            }}
          >
            <Text className="text-blue-700 font-bold">{hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}</Text>
          </TouchableOpacity>
          <Text className="text-gray-700 text-lg">שעת התראה</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <Text className="text-xl font-bold mb-4 text-right">מתקדם</Text>
        <TouchableOpacity onPress={handleReset} className="bg-red-50 p-4 rounded-xl items-center">
          <Text className="text-red-600 font-bold text-lg">מחק את כל הנתונים</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
