import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import * as Notifications from 'expo-notifications';
import { resetDB } from '../db/database';
import { SettingItem } from '../components/Settings/SettingItem';
import { SectionHeader } from '../components/Settings/SectionHeader';
import { TimePickerModal } from '../components/Settings/TimePickerModal';
import { THEME } from '../theme';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingsScreen() {
  const { settings, updateNotificationSettings, loadInitialData } = useAppStore();
  const [shabbatEnabled, setShabbatEnabled] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShabbatEnabled(settings.enable_shabbat_notifications === 1);
    }
  }, [settings]);

  const saveSettings = async (newHour: number, newMin: number, newShabbat: boolean) => {
    updateNotificationSettings(newHour, newMin, newShabbat);
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕯️ הגיע זמן הדף היומי',
          body: 'אל תשכח לסמן את הלימוד של היום!',
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
      console.error('Failed to schedule notification:', error);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const onConfirmReset = () => {
    resetDB();
    loadInitialData();
    setShowResetModal(false);
    Alert.alert('הצלחנו', 'הנתונים נמחקו בהצלחה');
  };


  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >


        <View style={styles.settingsBody}>
          <SectionHeader title="התראות ותזכורות" />
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              title="תזכורת יומית"
              description="קבל התראה בשעה היעודה"
              type="switch"
              value={true}
              onPress={() => {}}
            />
            <SettingItem
              icon="time-outline"
              title="זמן ההתראה"
              description="מתי תרצה ללמוד היום?"
              value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
              onPress={() => setShowTimePicker(true)}
            />

          </View>

          <SectionHeader title="נתונים ופרטיות" />
          <View style={styles.card}>
            <SettingItem
              icon="trash-outline"
              title="איפוס נתונים"
              description="מחיקת כל התקדמות הלימוד"
              isDestructive
              onPress={handleReset}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>פותח באהבה ע״י שמואל רוזנברג</Text>

          </View>
        </View>
      </ScrollView>

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        hour={hour}
        minute={minute}
        onSave={(newHour, newMinute) => {
          setHour(newHour);
          setMinute(newMinute);
          saveSettings(newHour, newMinute, shabbatEnabled);
          setShowTimePicker(false);
        }}
      />
      <ConfirmModal
        visible={showResetModal}
        title="מחיקת נתונים"
        message="האם אתה בטוח שברצונך למחוק את כל היסטוריית הלימוד? פעולה זו אינה ניתנת לביטול."
        onConfirm={onConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  settingsBody: {
    marginTop: 10,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadow.card,
  },
  footer: {
    marginTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: THEME.colors.border,
    marginBottom: 4,
  },
  footerText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

});
