import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { resetDB } from "../db/database";
import { SettingItem } from "../components/Settings/SettingItem";
import { SectionHeader } from "../components/Settings/SectionHeader";
import { TimePickerModal } from "../components/Settings/TimePickerModal";
import { ThemeModeModal } from "../components/Settings/ThemeModeModal";
import { NotifModeToggle } from "../components/Settings/NotifModeToggle";
import { GuideModal } from "../components/Settings/GuideModal";
import {
  DayScheduleList,
  DaySchedule,
} from "../components/Settings/DayScheduleList";
import { SettingsFooter } from "../components/Settings/SettingsFooter";
import ScreenTopGradient from "../components/ScreenTopGradient";
import { ThemeMode, useTheme } from "../theme";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import {
  scheduleNotifications,
  DEFAULT_SCHEDULES,
  sendTestNotification,
  getScheduledNotifications,
} from "../utils/notifications";

const fmtTime = (h: number, m: number) =>
  `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

const IS_DEV = __DEV__;

const PulsingBook = () => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="book" size={40} color={theme.colors.accent} />
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { settings, updateNotificationSettings, updateThemeMode, loadInitialData } =
    useAppStore(
      useShallow((s) => ({
        settings: s.settings,
        updateNotificationSettings: s.updateNotificationSettings,
        updateThemeMode: s.updateThemeMode,
        loadInitialData: s.loadInitialData,
      })),
    );
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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

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

  const saveAndSchedule = useCallback(
    async (
      h: number,
      m: number,
      mode: "daily" | "custom",
      schedules: DaySchedule[],
      enabled: boolean,
      secular: boolean,
      confetti: boolean,
    ) => {
      setIsSaving(true);
      try {
        updateNotificationSettings(
          h,
          m,
          secular,
          confetti,
          enabled,
          mode,
          JSON.stringify(schedules),
        );
        await scheduleNotifications(h, m, mode, schedules, enabled);
        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Save error:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [updateNotificationSettings],
  );

  const handleModeChange = useCallback((mode: "daily" | "custom") => {
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
  }, [hour, minute, daySchedules, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule]);

  const handleToggleDay = useCallback((index: number) => {
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
  }, [daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule]);

  const handleEditDayTime = useCallback((index: number) => {
    setEditingDay(index);
    setShowTimePicker(true);
  }, []);

  const handleTimeSave = useCallback((newHour: number, newMinute: number) => {
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
  }, [editingDay, daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule]);

  const onConfirmReset = useCallback(() => {
    resetDB();
    loadInitialData();
    setShowResetModal(false);
    setShowSuccessModal(true);
  }, [loadInitialData]);

  const handleNotificationsToggle = useCallback((val: boolean) => {
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
  }, [hour, minute, notifMode, daySchedules, showSecularDate, showConfettiPref, saveAndSchedule]);

  const handleSecularDateToggle = useCallback((val: boolean) => {
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
  }, [hour, minute, showConfettiPref, notificationsEnabled, notifMode, daySchedules, updateNotificationSettings]);

  const handleConfettiToggle = useCallback((val: boolean) => {
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
  }, [hour, minute, showSecularDate, notificationsEnabled, notifMode, daySchedules, updateNotificationSettings]);

  const handleThemeModeSelect = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    updateThemeMode(mode);
  }, [updateThemeMode]);

  const handleTimePickerOpen = useCallback(() => {
    setEditingDay(null);
    setShowTimePicker(true);
  }, []);

  const handleTimePickerClose = useCallback(() => {
    setShowTimePicker(false);
    setEditingDay(null);
  }, []);

  const handleThemeModalOpen = useCallback(() => {
    setShowThemeModal(true);
  }, []);

  const handleThemeModalClose = useCallback(() => {
    setShowThemeModal(false);
  }, []);

  const handleResetModalOpen = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const handleResetModalClose = useCallback(() => {
    setShowResetModal(false);
  }, []);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleGuideModalOpen = useCallback(() => {
    setShowGuideModal(true);
  }, []);

  const handleGuideModalClose = useCallback(() => {
    setShowGuideModal(false);
  }, []);

  const handleTestNotification = useCallback(async () => {
    await sendTestNotification();
    Alert.alert("התראת בדיקה", "התראת בדיקה תגיע בעוד 5 שניות");
  }, []);

  const handleCheckScheduled = useCallback(async () => {
    const notifications = await getScheduledNotifications();
    setScheduledCount(notifications.length);
    Alert.alert(
      "התראות מתוזמנות",
      `יש ${notifications.length} התראות מתוזמנות במערכת`
    );
  }, []);

  useEffect(() => {
    async function checkScheduled() {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    }
    checkScheduled();
  }, [notificationsEnabled, hour, minute, notifMode, daySchedules]);

  if (!settings) {
    return (
      <View
        style={[styles.loadingRoot, { backgroundColor: theme.colors.background }]}
      >
        <ScreenTopGradient />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            טוען הגדרות...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.screenRoot}>
        <ScreenTopGradient />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <View style={styles.pageHeader}>
              <View style={styles.headerRow}>
                <View style={styles.accentBar} />
                <Text style={styles.pageTitle}>הגדרות</Text>
              </View>
              <Text style={styles.pageSubtitle}>
                התראות, תצוגה וניהול נתונים
              </Text>
            </View>

            <SectionHeader title="התראות ותזכורות" />
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              title="תזכורת יומית"
              description="קבל התראה בשעה היעודה"
              type="switch"
              value={notificationsEnabled}
              onPress={handleNotificationsToggle}
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
                    onPress={handleTimePickerOpen}
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
              onPress={handleThemeModalOpen}
            />
            <SettingItem
              icon="help-circle-outline"
              title="מדריך שימוש"
              description="למד כיצד להשתמש בכל הפיצ'רים"
              onPress={handleGuideModalOpen}
            />
            <SettingItem
              icon="calendar-outline"
              title="הצג תאריך לועזי"
              description="הצגת התאריך הלועזי לצד העברי"
              type="switch"
              value={showSecularDate}
              onPress={handleSecularDateToggle}
            />
            <SettingItem
              icon="sparkles-outline"
              title="אפקטים חגיגיים"
              description="הצגת קונפטי בסיום לימוד דף"
              type="switch"
              value={showConfettiPref}
              onPress={handleConfettiToggle}
            />
          </View>

          {IS_DEV && (
            <>
              <SectionHeader title="דיבאג והתראות" />
              <View style={styles.card}>
                <SettingItem
                  icon="notifications-outline"
                  title="שלח התראת בדיקה"
                  description="בדוק שההתראות עובדות (תגיע בעוד 5 שניות)"
                  onPress={handleTestNotification}
                />
                <SettingItem
                  icon="list-outline"
                  title="בדוק התראות מתוזמנות"
                  description={`${scheduledCount} התראות מתוזמנות`}
                  onPress={handleCheckScheduled}
                />
              </View>
            </>
          )}

          <SectionHeader title="נתונים ופרטיות" />
          <View style={styles.card}>
            <SettingItem
              icon="trash-outline"
              title="איפוס נתונים"
              description="מחיקת כל התקדמות הלימוד"
              isDestructive
              onPress={handleResetModalOpen}
            />
          </View>

          <Text style={styles.privacyNote}>
            הנתונים שלך נשמרים באופן מקומי בלבד על המכשיר שלך.
          </Text>

          <SettingsFooter />
        </View>
        </ScrollView>
      </View>

      <ThemeModeModal
        visible={showThemeModal}
        value={themeMode}
        onClose={handleThemeModalClose}
        onSelect={handleThemeModeSelect}
      />
      <GuideModal
        visible={showGuideModal}
        onClose={handleGuideModalClose}
      />
      <TimePickerModal
        visible={showTimePicker}
        onClose={handleTimePickerClose}
        hour={editingDay !== null ? daySchedules[editingDay].hour : hour}
        minute={editingDay !== null ? daySchedules[editingDay].minute : minute}
        onSave={handleTimeSave}
      />
      <ConfirmModal
        visible={showResetModal}
        title="מחיקת נתונים"
        message="האם אתה בטוח שברצונך למחוק את כל היסטוריית הלימוד? פעולה זו אינה ניתנת לביטול."
        onConfirm={onConfirmReset}
        onCancel={handleResetModalClose}
      />
      <SuccessModal
        visible={showSuccessModal}
        title="הצלחנו!"
        message="הנתונים נמחקו בהצלחה. האפליקציה חזרה למצבה ההתחלתי."
        onClose={handleSuccessModalClose}
      />

      {isSaving && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <View style={styles.loaderCard}>
            <PulsingBook />
            <Text style={styles.loaderText}>מעדכן הגדרות...</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: { flex: 1 },
    screenRoot: { flex: 1, position: "relative" },
    scroll: { flex: 1, backgroundColor: "transparent" },
    content: { paddingTop: 24, paddingBottom: 12 },
    body: {},
    pageHeader: {
      paddingHorizontal: 20,
      marginBottom: 20,
      alignItems: "flex-start",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 4,
    },
    accentBar: {
      width: 4,
      height: 32,
      backgroundColor: theme.colors.accent,
      borderRadius: 2,
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: "900",
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    loadingRoot: {
      flex: 1,
      position: "relative",
    },
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "600",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    loaderCard: {
      backgroundColor: theme.colors.surface,
      padding: 30,
      borderRadius: 24,
      alignItems: "center",
      gap: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
      minWidth: 180,
    },
    loaderText: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 16,
    },
  });
