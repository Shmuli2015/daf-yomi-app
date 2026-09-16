import { useState, useEffect, useCallback } from 'react';
import type { SettingsRecord } from '../db/database';
import { ThemeMode } from '../theme';

interface UseSettingsDisplayPrefsParams {
  settings: SettingsRecord | null;
  updateThemeMode: (mode: string) => void;
  setShowCalendarDafEnabled: (enabled: boolean) => void;
  setShowPersonalTrackBannerEnabled: (enabled: boolean) => void;
  setShowSecularDateEnabled: (enabled: boolean) => void;
  setShowConfettiEnabled: (enabled: boolean) => void;
}

export function useSettingsDisplayPrefs({
  settings,
  updateThemeMode,
  setShowCalendarDafEnabled,
  setShowPersonalTrackBannerEnabled,
  setShowSecularDateEnabled,
  setShowConfettiEnabled,
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
