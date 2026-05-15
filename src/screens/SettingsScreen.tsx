import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAppStore } from '../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { resetDB } from '../db/database';
import ScreenTopGradient from '../components/ScreenTopGradient';
import SettingsLoadingView from '../components/Settings/SettingsLoadingView';
import SettingsScrollContent from '../components/Settings/SettingsScrollContent';
import SettingsModals from '../components/Settings/SettingsModals';
import InfoModal, { type InfoModalIconName } from '../components/InfoModal';
import { createSettingsScreenStyles } from '../components/Settings/settingsScreenStyles';
import { ThemeMode, useTheme } from '../theme';
import {
  scheduleNotifications,
  DEFAULT_SCHEDULES,
  sendTestNotification,
  getScheduledNotifications,
} from '../utils/notifications';
import { parseDaySchedulesJson } from '../utils/settingsScreen';
import type { DaySchedule } from '../components/Settings/DayScheduleList';
import { useAppUpdateControls } from '../context/AppUpdateProvider';
import { isUpdateCheckConfigured } from '../services/appUpdate';

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const updateCtl = useAppUpdateControls();
  const { settings, updateNotificationSettings, updateThemeMode, loadInitialData } =
    useAppStore(
      useShallow(s => ({
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
  const [notifMode, setNotifMode] = useState<'daily' | 'custom'>('daily');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{
    title: string;
    message: string;
    emphasis?: string;
    iconName?: InfoModalIconName;
    actionLabel?: string;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShowSecularDate(settings.show_secular_date === 1);
      setShowConfettiPref(settings.show_confetti === 1);
      setNotificationsEnabled(settings.notifications_enabled === 1);
      setNotifMode((settings.notif_mode as 'daily' | 'custom') || 'daily');
      setThemeMode((settings.theme_mode as ThemeMode) || 'system');
      setDaySchedules(parseDaySchedulesJson(settings.day_schedules));
    }
  }, [settings]);

  const saveAndSchedule = useCallback(
    async (
      h: number,
      m: number,
      mode: 'daily' | 'custom',
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
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Save error:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [updateNotificationSettings],
  );

  const handleModeChange = useCallback(
    (mode: 'daily' | 'custom') => {
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
    },
    [hour, minute, daySchedules, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule],
  );

  const handleToggleDay = useCallback(
    (index: number) => {
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
    },
    [daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule],
  );

  const handleEditDayTime = useCallback((index: number) => {
    setEditingDay(index);
    setShowTimePicker(true);
  }, []);

  const handleTimeSave = useCallback(
    (newHour: number, newMinute: number) => {
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
    },
    [editingDay, daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule],
  );

  const onConfirmReset = useCallback(() => {
    resetDB();
    loadInitialData();
    setShowResetModal(false);
    setShowSuccessModal(true);
  }, [loadInitialData]);

  const handleNotificationsToggle = useCallback(
    (val: boolean) => {
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
    },
    [hour, minute, notifMode, daySchedules, showSecularDate, showConfettiPref, saveAndSchedule],
  );

  const handleSecularDateToggle = useCallback(
    (val: boolean) => {
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
    },
    [hour, minute, showConfettiPref, notificationsEnabled, notifMode, daySchedules, updateNotificationSettings],
  );

  const handleConfettiToggle = useCallback(
    (val: boolean) => {
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
    },
    [hour, minute, showSecularDate, notificationsEnabled, notifMode, daySchedules, updateNotificationSettings],
  );

  const handleThemeModeSelect = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      updateThemeMode(mode);
    },
    [updateThemeMode],
  );

  const handleTimePickerOpen = useCallback(() => {
    setEditingDay(null);
    setShowTimePicker(true);
  }, []);

  const handleTimePickerClose = useCallback(() => {
    setShowTimePicker(false);
    setEditingDay(null);
  }, []);

  const handleTestNotification = useCallback(async () => {
    await sendTestNotification();
    Alert.alert('התראת בדיקה', 'התראת בדיקה תגיע בעוד 5 שניות');
  }, []);

  const handleCheckScheduled = useCallback(async () => {
    const notifications = await getScheduledNotifications();
    setScheduledCount(notifications.length);
    Alert.alert('התראות מתוזמנות', `יש ${notifications.length} התראות מתוזמנות במערכת`);
  }, []);

  const handleCheckAppUpdates = useCallback(async () => {
    if (!isUpdateCheckConfigured()) {
      setUpdateFeedback({
        title: 'בדיקת עדכונים',
        message:
          'החיבור לשרת העדכונים לא הוגדר בהגדרות האפליקציה. אם אתה מפתח הפרויקט, ודא שבקובץ app.config מוגדרים githubOwner, githubRepo.',
        iconName: 'settings-outline',
        actionLabel: 'הבנתי',
      });
      return;
    }
    const r = await updateCtl.checkManualAsync();
    if (r === 'opened') return;
    if (r === 'dismissed') {
      setUpdateFeedback({
        title: 'נזכיר כשיהיה חדש',
        message:
          'סימנת «אחר כך» על העדכון האחרון. לא נציג שוב את אותה גרסה; כשנפרסם עדכון חדש יותר, הוא יוצג שוב.',
        iconName: 'time-outline',
        actionLabel: 'סגור',
      });
      return;
    }
    const ver = Constants.expoConfig?.version;
    setUpdateFeedback({
      title: 'הכל עדכני',
      message:
        'גרסת מסע דף שלך תואמת לגרסה האחרונה שפורסמה. כשנוסיף שיפורים ונפרסם גרסה חדשה, תוכל לעדכן מכאן.',
      emphasis: ver ? `גרסה מותקנת: ${ver}` : undefined,
      iconName: 'checkmark-circle',
      actionLabel: 'מצוין',
    });
  }, [updateCtl]);

  const updatesConfigured = isUpdateCheckConfigured();

  useEffect(() => {
    async function checkScheduled() {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    }
    checkScheduled();
  }, [notificationsEnabled, hour, minute, notifMode, daySchedules]);

  if (!settings) {
    return <SettingsLoadingView />;
  }

  return (
    <View style={[styles.screenOuter, { backgroundColor: theme.colors.background }]}>
      <ScreenTopGradient />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.screenRoot}>
          <SettingsScrollContent
            styles={styles}
            notificationsEnabled={notificationsEnabled}
            onNotificationsToggle={handleNotificationsToggle}
            notifMode={notifMode}
            onNotifModeChange={handleModeChange}
            hour={hour}
            minute={minute}
            daySchedules={daySchedules}
            onDailyTimePress={handleTimePickerOpen}
            onToggleDay={handleToggleDay}
            onEditDayTime={handleEditDayTime}
            themeMode={themeMode}
            onThemeModalOpen={() => setShowThemeModal(true)}
            onGuideModalOpen={() => setShowGuideModal(true)}
            showSecularDate={showSecularDate}
            onSecularDateToggle={handleSecularDateToggle}
            showConfettiPref={showConfettiPref}
            onConfettiToggle={handleConfettiToggle}
            showDevSection={__DEV__}
            scheduledCount={scheduledCount}
            onTestNotification={handleTestNotification}
            onCheckScheduled={handleCheckScheduled}
            onResetModalOpen={() => setShowResetModal(true)}
            onCheckAppUpdate={updatesConfigured ? handleCheckAppUpdates : undefined}
            onPreviewUpdateModal={__DEV__ ? updateCtl.showPreviewMock : undefined}
            onProbeGithubRelease={__DEV__ ? updateCtl.probeGithubRelease : undefined}
          />
        </View>

        <SettingsModals
          themeMode={themeMode}
          showThemeModal={showThemeModal}
          onThemeModalClose={() => setShowThemeModal(false)}
          onThemeModeSelect={handleThemeModeSelect}
          showGuideModal={showGuideModal}
          onGuideModalClose={() => setShowGuideModal(false)}
          showTimePicker={showTimePicker}
          onTimePickerClose={handleTimePickerClose}
          timePickerHour={editingDay !== null ? daySchedules[editingDay].hour : hour}
          timePickerMinute={editingDay !== null ? daySchedules[editingDay].minute : minute}
          onTimeSave={handleTimeSave}
          showResetModal={showResetModal}
          onResetModalClose={() => setShowResetModal(false)}
          onConfirmReset={onConfirmReset}
          showSuccessModal={showSuccessModal}
          onSuccessModalClose={() => setShowSuccessModal(false)}
          isSaving={isSaving}
        />

        <InfoModal
          visible={updateFeedback != null}
          onClose={() => setUpdateFeedback(null)}
          title={updateFeedback?.title ?? ''}
          message={updateFeedback?.message ?? ''}
          emphasis={updateFeedback?.emphasis}
          iconName={updateFeedback?.iconName}
          actionLabel={updateFeedback?.actionLabel ?? 'הבנתי'}
        />
      </SafeAreaView>
    </View>
  );
}
