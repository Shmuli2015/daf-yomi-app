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
import {
  getNotificationPermissionStatus,
  openNotificationSettings,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from '../utils/notificationPermission';
import { parseDaySchedulesJson, schedulesUseDefaultTimes } from '../utils/settingsScreen';
import type { DaySchedule } from '../components/Settings/DayScheduleList';
import { DAY_LABELS } from '../components/Settings/DayScheduleList.constants';
import type { SettingsRecord } from '../db/database';
import type { SettingsFeedback } from './useSettingsFeedback';

interface UseSettingsNotificationsParams {
  settings: SettingsRecord | null;
  updateNotificationSettings: (
    hour: number,
    minute: number,
    showSecular: boolean,
    showConfetti: boolean,
    enabled: boolean,
    mode: string,
    daySchedules: string,
  ) => void;
  showSecularDate: boolean;
  showConfettiPref: boolean;
  onFeedback: (feedback: SettingsFeedback) => void;
  setNotificationSoundEnabled: (enabled: boolean) => void;
}

export function useSettingsNotifications({
  settings,
  updateNotificationSettings,
  showSecularDate,
  showConfettiPref,
  onFeedback,
  setNotificationSoundEnabled,
}: UseSettingsNotificationsParams) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifMode, setNotifMode] = useState<'daily' | 'custom'>('daily');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [exactAlarmStatus, setExactAlarmStatus] = useState<ExactAlarmStatus>('not_required');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setNotificationsEnabled(settings.notifications_enabled === 1);
      setNotifMode((settings.notif_mode as 'daily' | 'custom') || 'daily');
      setDaySchedules(parseDaySchedulesJson(settings.day_schedules));
      setSoundEnabled(settings.notification_sound_enabled !== 0);
    }
  }, [settings]);

  const refreshExactAlarmStatus = useCallback(async () => {
    if (!requiresExactAlarmPermission()) {
      setExactAlarmStatus('not_required');
      return;
    }
    setExactAlarmStatus(await getExactAlarmStatus());
  }, []);

  const refreshPermissionStatus = useCallback(async () => {
    setPermissionStatus(await getNotificationPermissionStatus());
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
      sound = soundEnabled,
    ) => {
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
        const osStatus = await getNotificationPermissionStatus();
        setPermissionStatus(osStatus);
        await scheduleNotifications(h, m, mode, schedules, enabled && osStatus === 'granted', {
          promptForExactAlarm,
          sound,
        });
        await refreshExactAlarmStatus();
      } catch (error) {
        console.error('Save error:', error);
      }
    },
    [updateNotificationSettings, refreshExactAlarmStatus, soundEnabled],
  );

  const handleModeChange = useCallback(
    (mode: 'daily' | 'custom') => {
      let schedules = daySchedules;
      if (mode === 'custom' && schedulesUseDefaultTimes(daySchedules)) {
        schedules = daySchedules.map(schedule =>
          schedule.enabled ? { ...schedule, hour, minute } : schedule,
        );
        setDaySchedules(schedules);
      }
      setNotifMode(mode);
      saveAndSchedule(
        hour,
        minute,
        mode,
        schedules,
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

  const handleApplyTimeToActiveDays = useCallback(
    (newHour: number, newMinute: number) => {
      const updated = daySchedules.map(schedule =>
        schedule.enabled ? { ...schedule, hour: newHour, minute: newMinute } : schedule,
      );
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
      setShowTimePicker(false);
      setEditingDay(null);
    },
    [daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule],
  );

  const handleDisableEditingDay = useCallback(() => {
    if (editingDay === null) return;
    const updated = [...daySchedules];
    updated[editingDay] = { ...updated[editingDay], enabled: false };
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
    setShowTimePicker(false);
    setEditingDay(null);
  }, [editingDay, daySchedules, hour, minute, notifMode, notificationsEnabled, showSecularDate, showConfettiPref, saveAndSchedule]);

  const timePickerTitle =
    editingDay !== null ? `התראה ביום ${DAY_LABELS[editingDay]}` : 'בחר שעת התראה';


  const handleNotificationsToggle = useCallback(
    async (val: boolean) => {
      if (val) {
        const osStatus = await requestNotificationPermission();
        setPermissionStatus(osStatus);
        if (osStatus !== 'granted') {
          setNotificationsEnabled(false);
          await saveAndSchedule(
            hour,
            minute,
            notifMode,
            daySchedules,
            false,
            showSecularDate,
            showConfettiPref,
            false,
          );
          onFeedback({
            title: 'נדרשת הרשאת התראות',
            message: 'כדי לקבל תזכורת יומית יש לאשר התראות בהגדרות המכשיר.',
            iconName: 'notifications-outline',
            compact: true,
          });
          return;
        }
      }
      setNotificationsEnabled(val);
      await saveAndSchedule(
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
    [hour, minute, notifMode, daySchedules, showSecularDate, showConfettiPref, saveAndSchedule, onFeedback],
  );

  const handleSoundToggle = useCallback(
    (enabled: boolean) => {
      setSoundEnabled(enabled);
      setNotificationSoundEnabled(enabled);
      void saveAndSchedule(
        hour,
        minute,
        notifMode,
        daySchedules,
        notificationsEnabled,
        showSecularDate,
        showConfettiPref,
        false,
        enabled,
      );
    },
    [
      hour,
      minute,
      notifMode,
      daySchedules,
      notificationsEnabled,
      showSecularDate,
      showConfettiPref,
      saveAndSchedule,
      setNotificationSoundEnabled,
    ],
  );

  const handleExactAlarmSettingsPress = useCallback(async () => {
    await openExactAlarmSettings();
  }, []);

  const handleNotificationPermissionPress = useCallback(async () => {
    await openNotificationSettings();
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
    await sendTestNotification(soundEnabled);
    onFeedback({
      title: 'התראת בדיקה',
      message: 'התראת בדיקה תגיע בעוד 5 שניות',
      iconName: 'notifications-outline',
      toast: true,
      autoCloseMs: 3000,
    });
  }, [onFeedback, soundEnabled]);

  const handleCheckScheduled = useCallback(async () => {
    const notifications = await getScheduledNotifications();
    setScheduledCount(notifications.length);
    onFeedback({
      title: 'התראות מתוזמנות',
      message: `יש ${notifications.length} התראות מתוזמנות במערכת`,
      iconName: 'list-outline',
      toast: true,
      autoCloseMs: 3000,
    });
  }, [onFeedback]);

  useEffect(() => {
    async function refreshScheduledCount() {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    }
    refreshScheduledCount();
  }, [notificationsEnabled, hour, minute, notifMode, daySchedules, soundEnabled]);

  useEffect(() => {
    void refreshExactAlarmStatus();
    void refreshPermissionStatus();
  }, [refreshExactAlarmStatus, refreshPermissionStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void refreshPermissionStatus();
        if (Platform.OS === 'android') {
          void refreshExactAlarmStatus();
        }
      }
    });

    return () => subscription.remove();
  }, [refreshExactAlarmStatus, refreshPermissionStatus]);

  return {
    hour,
    minute,
    notificationsEnabled,
    notifMode,
    daySchedules,
    editingDay,
    showTimePicker,
    exactAlarmStatus,
    permissionStatus,
    soundEnabled,
    scheduledCount,
    refreshExactAlarmStatus,
    saveAndSchedule,
    handleModeChange,
    handleToggleDay,
    handleEditDayTime,
    handleTimeSave,
    handleApplyTimeToActiveDays,
    handleDisableEditingDay,
    timePickerTitle,
    handleNotificationsToggle,
    handleSoundToggle,
    handleExactAlarmSettingsPress,
    handleNotificationPermissionPress,
    handleTimePickerOpen,
    handleTimePickerClose,
    handleTestNotification,
    handleCheckScheduled,
  };
}
