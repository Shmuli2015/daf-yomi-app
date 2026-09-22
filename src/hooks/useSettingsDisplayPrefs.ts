import { useState, useEffect, useCallback } from 'react';
import type { SettingsRecord } from '../db/database';
import { getSettings } from '../db/database';
import { ThemeMode } from '../theme';
import {
  DAF_DAY_START_DEFAULT_HOUR,
  DAF_DAY_START_DEFAULT_MINUTE,
  DEFAULT_DAF_DAY_START_SCHEDULES,
  normalizeDafDayStartMode,
  parseDafDayStartSchedules,
  type DafDayStartDaySchedule,
  type DafDayStartMode,
} from '../utils/dafDayBoundary';
import { getNotificationPermissionStatus } from '../utils/notificationPermission';
import { parseDaySchedulesJson } from '../utils/settingsScreen';
import { scheduleNotifications } from '../utils/notifications';
import { DAY_LABELS } from '../components/Settings/DayScheduleList.constants';

interface UseSettingsDisplayPrefsParams {
  settings: SettingsRecord | null;
  updateThemeMode: (mode: string) => void;
  setShowCalendarDafEnabled: (enabled: boolean) => void;
  setShowPersonalTrackBannerEnabled: (enabled: boolean) => void;
  setShowSecularDateEnabled: (enabled: boolean) => void;
  setShowConfettiEnabled: (enabled: boolean) => void;
  setDafDayStartMode: (mode: string) => void;
  setDafDayStartTime: (hour: number, minute: number) => void;
  setDafDayStartSchedules: (schedules: DafDayStartDaySchedule[]) => void;
}

async function rescheduleStudyReminders() {
  const current = getSettings();
  const osStatus = await getNotificationPermissionStatus();
  await scheduleNotifications(
    current.notification_hour,
    current.notification_minute,
    (current.notif_mode as 'daily' | 'custom') || 'daily',
    parseDaySchedulesJson(current.day_schedules),
    current.notifications_enabled === 1 && osStatus === 'granted',
    { sound: current.notification_sound_enabled !== 0 },
  );
}

export function useSettingsDisplayPrefs({
  settings,
  updateThemeMode,
  setShowCalendarDafEnabled,
  setShowPersonalTrackBannerEnabled,
  setShowSecularDateEnabled,
  setShowConfettiEnabled,
  setDafDayStartMode,
  setDafDayStartTime,
  setDafDayStartSchedules,
}: UseSettingsDisplayPrefsParams) {
  const [showSecularDate, setShowSecularDate] = useState(true);
  const [showCalendarDaf, setShowCalendarDaf] = useState(false);
  const [showPersonalTrackBannerPref, setShowPersonalTrackBannerPref] = useState(true);
  const [showConfettiPref, setShowConfettiPref] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [dafDayStartMode, setDafDayStartModeState] = useState<DafDayStartMode>('midnight');
  const [dafDayStartHour, setDafDayStartHourState] = useState(DAF_DAY_START_DEFAULT_HOUR);
  const [dafDayStartMinute, setDafDayStartMinuteState] = useState(DAF_DAY_START_DEFAULT_MINUTE);
  const [dafDayStartSchedules, setDafDayStartSchedulesState] = useState<DafDayStartDaySchedule[]>(
    DEFAULT_DAF_DAY_START_SCHEDULES,
  );
  const [showDafDayStartModeModal, setShowDafDayStartModeModal] = useState(false);
  const [showDafDayStartTimePicker, setShowDafDayStartTimePicker] = useState(false);
  const [editingDafDayIndex, setEditingDafDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (settings) {
      setShowSecularDate(settings.show_secular_date === 1);
      setShowCalendarDaf(settings.show_calendar_daf === 1);
      setShowPersonalTrackBannerPref(settings.show_personal_track_banner !== 0);
      setShowConfettiPref(settings.show_confetti === 1);
      setThemeMode((settings.theme_mode as ThemeMode) || 'system');
      setDafDayStartModeState(normalizeDafDayStartMode(settings.daf_day_start_mode));
      setDafDayStartHourState(settings.daf_day_start_hour ?? DAF_DAY_START_DEFAULT_HOUR);
      setDafDayStartMinuteState(settings.daf_day_start_minute ?? DAF_DAY_START_DEFAULT_MINUTE);
      setDafDayStartSchedulesState(
        parseDafDayStartSchedules(
          settings.daf_day_start_schedules,
          settings.daf_day_start_hour,
          settings.daf_day_start_minute,
        ),
      );
    }
  }, [settings]);

  const handleSecularDateToggle = useCallback(
    (val: boolean) => {
      setShowSecularDate(val);
      setShowSecularDateEnabled(val);
    },
    [setShowSecularDateEnabled],
  );

  const handleConfettiToggle = useCallback(
    (val: boolean) => {
      setShowConfettiPref(val);
      setShowConfettiEnabled(val);
    },
    [setShowConfettiEnabled],
  );

  const handleCalendarDafToggle = useCallback(
    (val: boolean) => {
      setShowCalendarDaf(val);
      setShowCalendarDafEnabled(val);
    },
    [setShowCalendarDafEnabled],
  );

  const handlePersonalTrackBannerToggle = useCallback(
    (val: boolean) => {
      setShowPersonalTrackBannerPref(val);
      setShowPersonalTrackBannerEnabled(val);
    },
    [setShowPersonalTrackBannerEnabled],
  );

  const handleThemeModeSelect = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      updateThemeMode(mode);
    },
    [updateThemeMode],
  );

  const handleDafDayStartModeSelect = useCallback(
    (mode: DafDayStartMode) => {
      const switchingToCustom = mode === 'custom_hour' && dafDayStartMode !== 'custom_hour';
      setDafDayStartModeState(mode);
      setDafDayStartMode(mode);
      if (mode !== 'custom_hour') {
        setShowDafDayStartTimePicker(false);
        setEditingDafDayIndex(null);
      }
      void rescheduleStudyReminders();
      if (switchingToCustom) {
        setTimeout(() => {
          setShowDafDayStartTimePicker(true);
        }, 320);
      }
    },
    [dafDayStartMode, setDafDayStartMode],
  );

  const handleEditDafDayStartDay = useCallback((index: number) => {
    setEditingDafDayIndex(index);
    setShowDafDayStartTimePicker(true);
  }, []);

  const handleDafDayStartTimeSave = useCallback(
    (hour: number, minute: number) => {
      if (editingDafDayIndex !== null) {
        const next = dafDayStartSchedules.map((item, index) =>
          index === editingDafDayIndex ? { hour, minute } : item,
        );
        setDafDayStartSchedulesState(next);
        setDafDayStartSchedules(next);
        setEditingDafDayIndex(null);
      } else {
        setDafDayStartHourState(hour);
        setDafDayStartMinuteState(minute);
        setDafDayStartTime(hour, minute);
      }
      setShowDafDayStartTimePicker(false);
      void rescheduleStudyReminders();
    },
    [dafDayStartSchedules, editingDafDayIndex, setDafDayStartSchedules, setDafDayStartTime],
  );

  const closeDafDayStartTimePicker = useCallback(() => {
    setShowDafDayStartTimePicker(false);
    setEditingDafDayIndex(null);
  }, []);

  const dafDayStartTimePickerHour =
    editingDafDayIndex !== null
      ? dafDayStartSchedules[editingDafDayIndex].hour
      : dafDayStartHour;
  const dafDayStartTimePickerMinute =
    editingDafDayIndex !== null
      ? dafDayStartSchedules[editingDafDayIndex].minute
      : dafDayStartMinute;
  const dafDayStartTimePickerTitle =
    editingDafDayIndex !== null
      ? `שעת החלפה ביום ${DAY_LABELS[editingDafDayIndex]}`
      : 'בחר שעת החלפת הדף';

  return {
    showSecularDate,
    showCalendarDaf,
    showPersonalTrackBannerPref,
    showConfettiPref,
    themeMode,
    dafDayStartMode,
    dafDayStartHour,
    dafDayStartMinute,
    dafDayStartSchedules,
    showDafDayStartModeModal,
    showDafDayStartTimePicker,
    dafDayStartTimePickerHour,
    dafDayStartTimePickerMinute,
    dafDayStartTimePickerTitle,
    openDafDayStartModeModal: () => setShowDafDayStartModeModal(true),
    closeDafDayStartModeModal: () => setShowDafDayStartModeModal(false),
    openDafDayStartTimePicker: () => {
      setEditingDafDayIndex(null);
      setShowDafDayStartTimePicker(true);
    },
    closeDafDayStartTimePicker,
    handleSecularDateToggle,
    handleConfettiToggle,
    handleCalendarDafToggle,
    handlePersonalTrackBannerToggle,
    handleThemeModeSelect,
    handleDafDayStartModeSelect,
    handleDafDayStartTimeSave,
    handleEditDafDayStartDay,
  };
}
