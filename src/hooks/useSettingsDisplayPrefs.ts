import { useState, useEffect, useCallback } from 'react';
import type { SettingsRecord } from '../db/database';
import { ThemeMode } from '../theme';
import { parseDaySchedulesJson } from '../utils/settingsScreen';

interface UseSettingsDisplayPrefsParams {
  settings: SettingsRecord | null;
  updateNotificationSettings: (
    hour: number,
    minute: number,
    showSecular: boolean,
    showConfetti: boolean,
    notificationsEnabled: boolean,
    notifMode?: string,
    daySchedules?: string | null,
  ) => void;
  updateThemeMode: (mode: string) => void;
  setShowCalendarDafEnabled: (enabled: boolean) => void;
  setShowPersonalTrackBannerEnabled: (enabled: boolean) => void;
}

export function useSettingsDisplayPrefs({
  settings,
  updateNotificationSettings,
  updateThemeMode,
  setShowCalendarDafEnabled,
  setShowPersonalTrackBannerEnabled,
}: UseSettingsDisplayPrefsParams) {
  const [showSecularDate, setShowSecularDate] = useState(true);
  const [showCalendarDaf, setShowCalendarDaf] = useState(false);
  const [showPersonalTrackBannerPref, setShowPersonalTrackBannerPref] = useState(true);
  const [showConfettiPref, setShowConfettiPref] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    if (settings) {
      setShowSecularDate(settings.show_secular_date === 1);
      setShowCalendarDaf(settings.show_calendar_daf === 1);
      setShowPersonalTrackBannerPref(settings.show_personal_track_banner !== 0);
      setShowConfettiPref(settings.show_confetti === 1);
      setThemeMode((settings.theme_mode as ThemeMode) || 'system');
    }
  }, [settings]);

  const persistDisplayFlags = useCallback(
    (secular: boolean, confetti: boolean) => {
      if (!settings) return;
      updateNotificationSettings(
        settings.notification_hour,
        settings.notification_minute,
        secular,
        confetti,
        settings.notifications_enabled === 1,
        settings.notif_mode || 'daily',
        JSON.stringify(parseDaySchedulesJson(settings.day_schedules)),
      );
    },
    [settings, updateNotificationSettings],
  );

  const handleSecularDateToggle = useCallback(
    (val: boolean) => {
      setShowSecularDate(val);
      persistDisplayFlags(val, showConfettiPref);
    },
    [showConfettiPref, persistDisplayFlags],
  );

  const handleConfettiToggle = useCallback(
    (val: boolean) => {
      setShowConfettiPref(val);
      persistDisplayFlags(showSecularDate, val);
    },
    [showSecularDate, persistDisplayFlags],
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

  return {
    showSecularDate,
    showCalendarDaf,
    showPersonalTrackBannerPref,
    showConfettiPref,
    themeMode,
    handleSecularDateToggle,
    handleConfettiToggle,
    handleCalendarDafToggle,
    handlePersonalTrackBannerToggle,
    handleThemeModeSelect,
  };
}
