import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import * as Notifications from 'expo-notifications';
import { resetDB } from '../db/database';
import { SettingItem } from '../components/Settings/SettingItem';
import { SectionHeader } from '../components/Settings/SectionHeader';
import { TimePickerModal } from '../components/Settings/TimePickerModal';
import { NotifModeToggle } from '../components/Settings/NotifModeToggle';
import { DayScheduleList, DaySchedule } from '../components/Settings/DayScheduleList';
import { SettingsFooter } from '../components/Settings/SettingsFooter';
import { THEME } from '../theme';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_SCHEDULES: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 6,
  hour: 7,
  minute: 30,
}));

const fmtTime = (h: number, m: number) =>
  `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

export default function SettingsScreen() {
  const { settings, updateNotificationSettings, loadInitialData } = useAppStore();
  const [shabbatEnabled, setShabbatEnabled] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notifMode, setNotifMode] = useState<'daily' | 'custom'>('daily');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShabbatEnabled(settings.enable_shabbat_notifications === 1);
    }
  }, [settings]);

  const scheduleNotifications = async (
    globalHour: number,
    globalMin: number,
    mode: 'daily' | 'custom',
    schedules: DaySchedule[]
  ) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (mode === 'daily') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🕯️ הגיע זמן הדף היומי',
            body: 'אל תשכח לסמן את הלימוד של היום!',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: globalHour,
            minute: globalMin,
          },
        });
      } else {
        for (let i = 0; i < schedules.length; i++) {
          const s = schedules[i];
          if (!s.enabled) continue;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🕯️ הגיע זמן הדף היומי',
              body: 'אל תשכח לסמן את הלימוד של היום!',
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: i + 1,
              hour: s.hour,
              minute: s.minute,
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const handleModeChange = (mode: 'daily' | 'custom') => {
    setNotifMode(mode);
    scheduleNotifications(hour, minute, mode, daySchedules);
  };

  const handleToggleDay = (index: number) => {
    const updated = [...daySchedules];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setDaySchedules(updated);
    scheduleNotifications(hour, minute, notifMode, updated);
  };

  const handleEditDayTime = (index: number) => {
    setEditingDay(index);
    setShowTimePicker(true);
  };

  const handleTimeSave = (newHour: number, newMinute: number) => {
    if (editingDay !== null) {
      const updated = [...daySchedules];
      updated[editingDay] = { ...updated[editingDay], hour: newHour, minute: newMinute };
      setDaySchedules(updated);
      scheduleNotifications(hour, minute, notifMode, updated);
    } else {
      setHour(newHour);
      setMinute(newMinute);
      updateNotificationSettings(newHour, newMinute, shabbatEnabled);
      scheduleNotifications(newHour, newMinute, notifMode, daySchedules);
    }
    setShowTimePicker(false);
    setEditingDay(null);
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
        <View style={styles.body}>
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
            <NotifModeToggle mode={notifMode} onChange={handleModeChange} />
            {notifMode === 'daily' && (
              <SettingItem
                icon="time-outline"
                title="זמן ההתראה"
                description="מתי תרצה ללמוד כל יום?"
                value={fmtTime(hour, minute)}
                onPress={() => {
                  setEditingDay(null);
                  setShowTimePicker(true);
                }}
              />
            )}
            {notifMode === 'custom' && (
              <DayScheduleList
                schedules={daySchedules}
                onToggleDay={handleToggleDay}
                onEditTime={handleEditDayTime}
              />
            )}
          </View>

          <SectionHeader title="נתונים ופרטיות" />
          <View style={styles.card}>
            <SettingItem
              icon="trash-outline"
              title="איפוס נתונים"
              description="מחיקת כל התקדמות הלימוד"
              isDestructive
              onPress={() => setShowResetModal(true)}
            />
          </View>

          <SettingsFooter />
        </View>
      </ScrollView>

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => { setShowTimePicker(false); setEditingDay(null); }}
        hour={editingDay !== null ? daySchedules[editingDay].hour : hour}
        minute={editingDay !== null ? daySchedules[editingDay].minute : minute}
        onSave={handleTimeSave}
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
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  body: { marginTop: 10 },
  card: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadow.card,
  },
});
