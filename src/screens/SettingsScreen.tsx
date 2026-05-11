import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../store/useAppStore";
import { resetDB } from "../db/database";
import { SettingItem } from "../components/Settings/SettingItem";
import { SectionHeader } from "../components/Settings/SectionHeader";
import { TimePickerModal } from "../components/Settings/TimePickerModal";
import { ThemeModeModal } from "../components/Settings/ThemeModeModal";
import { NotifModeToggle } from "../components/Settings/NotifModeToggle";
import {
  DayScheduleList,
  DaySchedule,
} from "../components/Settings/DayScheduleList";
import { SettingsFooter } from "../components/Settings/SettingsFooter";
import { ThemeMode, useTheme } from "../theme";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import {
  scheduleNotifications,
  DEFAULT_SCHEDULES,
} from "../utils/notifications";

const fmtTime = (h: number, m: number) =>
  `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    settings,
    updateNotificationSettings,
    updateThemeMode,
    loadInitialData,
  } = useAppStore();
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showSecularDate, setShowSecularDate] = useState(true);
  const [showConfettiPref, setShowConfettiPref] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notifMode, setNotifMode] = useState<"daily" | "custom">("daily");
  const [daySchedules, setDaySchedules] =
    useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShowSecularDate(settings.show_secular_date === 1);
      setShowConfettiPref(settings.show_confetti === 1);
      setNotificationsEnabled(settings.notifications_enabled === 1);
      setNotifMode((settings.notif_mode as "daily" | "custom") || "daily");
      setThemeMode((settings.theme_mode as ThemeMode) || "system");
      if (settings.day_schedules) {
        try {
          setDaySchedules(JSON.parse(settings.day_schedules));
        } catch {
          setDaySchedules(DEFAULT_SCHEDULES);
        }
      }
    }
  }, [settings]);

  // Persist to DB and reschedule in one shot
  const saveAndSchedule = useCallback(
    (
      h: number,
      m: number,
      mode: "daily" | "custom",
      schedules: DaySchedule[],
      enabled: boolean,
      secular: boolean,
      confetti: boolean,
    ) => {
      updateNotificationSettings(
        h,
        m,
        secular,
        confetti,
        enabled,
        mode,
        JSON.stringify(schedules),
      );
      scheduleNotifications(h, m, mode, schedules, enabled);
    },
    [updateNotificationSettings],
  );

  const handleModeChange = (mode: "daily" | "custom") => {
    setNotifMode(mode);
    saveAndSchedule(
      hour,
      minute,
      mode,
      daySchedules,
      notificationsEnabled,
      showSecularDate,
      showConfettiPref,
    );
  };

  const handleToggleDay = (index: number) => {
    const updated = [...daySchedules];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setDaySchedules(updated);
    saveAndSchedule(
      hour,
      minute,
      notifMode,
      updated,
      notificationsEnabled,
      showSecularDate,
      showConfettiPref,
    );
  };

  const handleEditDayTime = (index: number) => {
    setEditingDay(index);
    setShowTimePicker(true);
  };

  const handleTimeSave = (newHour: number, newMinute: number) => {
    if (editingDay !== null) {
      const updated = [...daySchedules];
      updated[editingDay] = {
        ...updated[editingDay],
        hour: newHour,
        minute: newMinute,
      };
      setDaySchedules(updated);
      saveAndSchedule(
        hour,
        minute,
        notifMode,
        updated,
        notificationsEnabled,
        showSecularDate,
        showConfettiPref,
      );
    } else {
      setHour(newHour);
      setMinute(newMinute);
      saveAndSchedule(
        newHour,
        newMinute,
        notifMode,
        daySchedules,
        notificationsEnabled,
        showSecularDate,
        showConfettiPref,
      );
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
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
              value={notificationsEnabled}
              onPress={(val) => {
                setNotificationsEnabled(val);
                saveAndSchedule(
                  hour,
                  minute,
                  notifMode,
                  daySchedules,
                  val,
                  showSecularDate,
                  showConfettiPref,
                );
              }}
            />
            {notificationsEnabled && (
              <>
                <NotifModeToggle mode={notifMode} onChange={handleModeChange} />
                {notifMode === "daily" && (
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
                {notifMode === "custom" && (
                  <DayScheduleList
                    schedules={daySchedules}
                    onToggleDay={handleToggleDay}
                    onEditTime={handleEditDayTime}
                  />
                )}
              </>
            )}
          </View>

          <SectionHeader title="תצוגה והעדפות" />
          <View style={styles.card}>
            <SettingItem
              icon={
                themeMode === "dark"
                  ? "moon-outline"
                  : themeMode === "light"
                    ? "sunny-outline"
                    : "contrast-outline"
              }
              title="מצב תצוגה"
              description="בחר מצב בהיר/כהה או לפי המערכת"
              value={
                themeMode === "system"
                  ? "מערכת"
                  : themeMode === "dark"
                    ? "כהה"
                    : "בהיר"
              }
              onPress={() => setShowThemeModal(true)}
            />
            <SettingItem
              icon="calendar-outline"
              title="הצג תאריך לועזי"
              description="הצגת התאריך הלועזי לצד העברי"
              type="switch"
              value={showSecularDate}
              onPress={(val) => {
                setShowSecularDate(val);
                updateNotificationSettings(
                  hour,
                  minute,
                  val,
                  showConfettiPref,
                  notificationsEnabled,
                  notifMode,
                  JSON.stringify(daySchedules),
                );
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
                updateNotificationSettings(
                  hour,
                  minute,
                  showSecularDate,
                  val,
                  notificationsEnabled,
                  notifMode,
                  JSON.stringify(daySchedules),
                );
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

      <ThemeModeModal
        visible={showThemeModal}
        value={themeMode}
        onClose={() => setShowThemeModal(false)}
        onSelect={(mode) => {
          setThemeMode(mode);
          updateThemeMode(mode);
        }}
      />
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => {
          setShowTimePicker(false);
          setEditingDay(null);
        }}
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

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: { flex: 1 },
    scroll: { flex: 1 },
    content: { paddingBottom: 40 },
    body: { marginTop: 10 },
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.card,
    },
    privacyNote: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: "center",
      marginTop: 24,
      marginHorizontal: 40,
      lineHeight: 18,
      opacity: 0.8,
    },
  });
