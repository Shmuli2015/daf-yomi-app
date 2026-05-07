import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import * as Notifications from 'expo-notifications';
import { resetDB } from '../db/database';
import { SettingItem } from '../components/Settings/SettingItem';
import { SectionHeader } from '../components/Settings/SectionHeader';
import { TimePickerModal } from '../components/Settings/TimePickerModal';

export default function SettingsScreen() {
  const { settings, updateNotificationSettings, loadInitialData } = useAppStore();
  const [shabbatEnabled, setShabbatEnabled] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🕯️ הגיע זמן הדף היומי",
          body: "אל תשכח לסמן את הלימוד של היום!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: newHour,
          minute: newMin,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "מחיקת נתונים",
      "האם אתה בטוח שברצונך למחוק את כל היסטוריית הלימוד? פעולה זו אינה ניתנת לביטול.",
      [
        { text: "ביטול", style: "cancel" },
        { 
          text: "מחק הכל", 
          style: "destructive", 
          onPress: () => {
            resetDB();
            loadInitialData();
            Alert.alert("הצלחנו", "הנתונים נמחקו בהצלחה");
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-6 pt-4 pb-2 border-b border-slate-100 bg-white">
        <Text className="text-3xl font-black text-slate-900 text-right">הגדרות</Text>
      </View>

      <ScrollView className="flex-1">
        <SectionHeader title="התראות" />
        <View className="bg-white overflow-hidden rounded-2xl mx-4 border border-slate-100 shadow-sm shadow-slate-200">
          <SettingItem 
            icon="notifications-outline" 
            title="התראות יומיות" 
            description="קבל תזכורת יומית ללימוד"
            type="switch"
            value={true}
            onPress={() => {}} 
          />
          <SettingItem 
            icon="time-outline" 
            title="זמן התראה" 
            description="בחר מתי לקבל את התזכורת"
            value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
            onPress={() => setShowTimePicker(true)}
          />
          <SettingItem 
            icon="sunny-outline" 
            title="התראות בשבת" 
            description="שלח התראות גם בימי שבת וחג"
            type="switch"
            value={shabbatEnabled}
            onPress={(val: boolean) => {
              setShabbatEnabled(val);
              saveSettings(hour, minute, val);
            }}
          />
        </View>

        <SectionHeader title="מתקדם" />
        <View className="bg-white overflow-hidden rounded-2xl mx-4 border border-slate-100 shadow-sm shadow-slate-200">
          <SettingItem 
            icon="trash-outline" 
            title="איפוס נתונים" 
            description="מחק את כל היסטוריית הלימוד שלך"
            isDestructive
            onPress={handleReset}
          />
        </View>

        <View className="py-10 items-center">
          <View className="bg-indigo-50 px-4 py-1.5 rounded-full mb-2">
            <Text className="text-indigo-600 font-bold text-xs">V1.0.4</Text>
          </View>
          <Text className="text-slate-400 text-xs font-semibold">פותח באהבה ע״י דף יומי</Text>
        </View>
      </ScrollView>

      <TimePickerModal 
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        hour={hour}
        minute={minute}
        setHour={setHour}
        setMinute={setMinute}
        onSave={() => {
          saveSettings(hour, minute, shabbatEnabled);
          setShowTimePicker(false);
        }}
      />
    </SafeAreaView>
  );
}
