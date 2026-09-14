import { useState, useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import {
  scheduleNotifications,
  sendTestNotification,
  getScheduledNotifications,
  DEFAULT_SCHEDULES,
} from '../utils/notifications';
import {
  getExactAlarmStatus,
  openExactAlarmSettings,
  requiresExactAlarmPermission,
  type ExactAlarmStatus,
} from '../utils/exactAlarm';
import { parseDaySchedulesJson } from '../utils/settingsScreen';
import type { DaySchedule } from '../components/Settings/DayScheduleList';
import type { SettingsRecord } from '../db/database';
import type { SettingsFeedback } from './useSettingsFeedback';

interface UseSettingsNotificationsParams {
  settings: SettingsRecord | null;
  updateNotificationSettings: (
    hour: number,
    minute: number,
    showSecularDate: boolean,
    showConfetti: boolean,
    enabled: boolean,
    mode: string,
    daySchedules: string,
  ) => void;
  showSecularDate: boolean;
  showConfettiPref: boolean;
  onFeedback: (feedback: SettingsFeedback) => void;
}

export function useSettingsNotifications({
  settings,
  updateNotificationSettings,
  showSecularDate,
  showConfettiPref,
  onFeedback,
}: UseSettingsNotificationsParams) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifMode, setNotifMode] = useState<'daily' | 'custom'>('daily');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [exactAlarmStatus, setExactAlarmStatus] = useState<ExactAlarmStatus>('not_required');
  const [isSaving, setIsSaving] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setNotificationsEnabled(settings.notifications_enabled === 1);
      setNotifMode((settings.notif_mode as 'daily' | 'custom') || 'daily');
      setDaySchedules(parseDaySchedulesJson(settings.day_schedules));
    }
  }, [settings]);

  const refreshExactAlarmStatus = useCallback(async () => {
    if (!requiresExactAlarmPermission()) {
      setExactAlarmStatus('not_required');
      return;
    }
    setExactAlarmStatus(await getExactAlarmStatus());
  }, []);

  const saveAndSchedule = useCallback(
    async (
      h: number,
      m: number,
      mode: 'daily' | 'custom',
      schedules: DaySchedule[],
      enabled: boolean,
      secular: boolean,
      confetti: boolean,
      promptForExactAlarm = false,
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
        await scheduleNotifications(h, m, mode, schedules, enabled, { promptForExactAlarm });
        await refreshExactAlarmStatus();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Save error:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [updateNotificationSettings, refreshExactAlarmStatus],
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
          notificationsEnabled,
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
          notificationsEnabled,
        );
      }
      setShowTimePicker(false);
      setEditingDay(null);
    },
    [editingDay, daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule],
  );

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
        val,
      );
    },
    [hour, minute, notifMode, daySchedules, showSecularDate, showConfettiPref, saveAndSchedule],
  );

  const handleExactAlarmSettingsPress = useCallback(async () => {
    await openExactAlarmSettings();
  }, []);

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
    onFeedback({
      title: 'התראת בדיקה',
      message: 'התראת בדיקה תגיע בעוד 5 שניות',
      iconName: 'notifications-outline',
      compact: true,
      autoCloseMs: 3000,
    });
  }, [onFeedback]);

  const handleCheckScheduled = useCallback(async () => {
    const notifications = await getScheduledNotifications();
    setScheduledCount(notifications.length);
    onFeedback({
      title: 'התראות מתוזמנות',
      message: `יש ${notifications.length} התראות מתוזמנות במערכת`,
      iconName: 'list-outline',
      compact: true,
    });
  }, [onFeedback]);

  useEffect(() => {
    async function refreshScheduledCount() {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    }
    refreshScheduledCount();
  }, [notificationsEnabled, hour, minute, notifMode, daySchedules]);

  useEffect(() => {
    void refreshExactAlarmStatus();
  }, [refreshExactAlarmStatus]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void refreshExactAlarmStatus();
      }
    });

    return () => subscription.remove();
  }, [refreshExactAlarmStatus]);

  return {
    hour,
    minute,
    notificationsEnabled,
    notifMode,
    daySchedules,
    editingDay,
    showTimePicker,
    exactAlarmStatus,
    isSaving,
    scheduledCount,
    refreshExactAlarmStatus,
    saveAndSchedule,
    handleModeChange,
    handleToggleDay,
    handleEditDayTime,
    handleTimeSave,
    handleNotificationsToggle,
    handleExactAlarmSettingsPress,
    handleTimePickerOpen,
    handleTimePickerClose,
    handleTestNotification,
    handleCheckScheduled,
  };
}
