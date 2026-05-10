import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
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
import SuccessModal from '../components/SuccessModal';

const DEFAULT_SCHEDULES: DaySchedule[] = Array.from({ length: 7 }, (_, i) => ({
  enabled: i < 6,
  hour: 7,
  minute: 30,
}));

const fmtTime = (h: number, m: number) =>
  `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

export default function SettingsScreen() {
  const { settings, updateNotificationSettings, loadInitialData } = useAppStore();
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showSecularDate, setShowSecularDate] = useState(true);
  const [showConfettiPref, setShowConfettiPref] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notifMode, setNotifMode] = useState<'daily' | 'custom'>('daily');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShowSecularDate(settings.show_secular_date === 1);
      setShowConfettiPref(settings.show_confetti === 1);
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
            title: '📖 זמן הלימוד היומי הגיע',
            subtitle: 'בוא נשמור על הרצף! ✨',
            body: 'הדף היומי מחכה לך. הגיע הזמן לצלול לתוך הים של התלמוד... 🕯️',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            categoryIdentifier: 'study-reminder',
          },
          trigger: {
            channelId: 'default',
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: globalHour,
            minute: globalMin,
            second: 0,
            repeats: true,
          },
        });
      } else {
        for (let i = 0; i < schedules.length; i++) {
          const s = schedules[i];
          if (!s.enabled) continue;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '📖 זמן הלימוד היומי הגיע',
              subtitle: 'בוא נשמור על הרצף! ✨',
              body: 'הדף היומי מחכה לך. הגיע הזמן לצלול לתוך הים של התלמוד... 🕯️',
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
              categoryIdentifier: 'study-reminder',
            },
            trigger: {
              channelId: 'default',
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              weekday: i + 1,
              hour: s.hour,
              minute: s.minute,
              second: 0,
              repeats: true,
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
      updateNotificationSettings(newHour, newMinute, showSecularDate, showConfettiPref);
      scheduleNotifications(newHour, newMinute, notifMode, daySchedules);
    }
    setShowTimePicker(false);
    setEditingDay(null);
  };

  const onConfirmReset = () => {
    resetDB();
    loadInitialData();
    setShowResetModal(false);
    setShowSuccessModal(true);
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

          <SectionHeader title="תצוגה והעדפות" />
          <View style={styles.card}>
            <SettingItem
              icon="calendar-outline"
              title="הצג תאריך לועזי"
              description="הצגת התאריך הלועזי לצד העברי"
              type="switch"
              value={showSecularDate}
              onPress={(val) => {
                setShowSecularDate(val);
                updateNotificationSettings(hour, minute, val, showConfettiPref);
              }}
            />
            <SettingItem
              icon="sparkles-outline"
              title="אפקטים חגיגיים"
              description="הצגת קונפטי בסיום לימוד דף"
              type="switch"
              value={showConfettiPref}
              onPress={(val) => {
                setShowConfettiPref(val);
                updateNotificationSettings(hour, minute, showSecularDate, val);
              }}
            />
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

          <Text style={styles.privacyNote}>
            הנתונים שלך נשמרים באופן מקומי בלבד על המכשיר שלך.
          </Text>

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
      <SuccessModal
        visible={showSuccessModal}
        title="הצלחנו!"
        message="הנתונים נמחקו בהצלחה. האפליקציה חזרה למצבה ההתחלתי."
        onClose={() => setShowSuccessModal(false)}
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
  privacyNote: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginHorizontal: 40,
    lineHeight: 18,
    opacity: 0.8,
  },
});
