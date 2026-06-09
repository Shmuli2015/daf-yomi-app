import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Share } from 'react-native';
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
import { parseStudyLinkMode, type StudyLinkMode } from '../utils/studyLinkMode';
import type { DaySchedule } from '../components/Settings/DayScheduleList';
import { useAppUpdateControls } from '../context/AppUpdateProvider';
import { isUpdateCheckConfigured } from '../services/appUpdate';
import { getDownloadPageUrl } from '../services/apkInstall';
import {
  saveBackupToDevice,
  exportAndShareBackup,
  pickAndReadBackupFile,
  getBackupPreview,
  type BackupData,
  type BackupPreview,
} from '../services/backup';

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const updateCtl = useAppUpdateControls();
  const { settings, updateNotificationSettings, updateThemeMode, updateStudyLinkMode, loadInitialData, setUpdateAutoPromptEnabled, setShowCalendarDafEnabled, importBackup } =
    useAppStore(
      useShallow(s => ({
        settings: s.settings,
        updateNotificationSettings: s.updateNotificationSettings,
        updateThemeMode: s.updateThemeMode,
        updateStudyLinkMode: s.updateStudyLinkMode,
        loadInitialData: s.loadInitialData,
        setUpdateAutoPromptEnabled: s.setUpdateAutoPromptEnabled,
        setShowCalendarDafEnabled: s.setShowCalendarDafEnabled,
        importBackup: s.importBackup,
      })),
    );
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [showSecularDate, setShowSecularDate] = useState(true);
  const [showCalendarDaf, setShowCalendarDaf] = useState(false);
  const [showConfettiPref, setShowConfettiPref] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notifMode, setNotifMode] = useState<'daily' | 'custom'>('daily');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(DEFAULT_SCHEDULES);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [studyLinkMode, setStudyLinkMode] = useState<StudyLinkMode>('both');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [showBackupImportModal, setShowBackupImportModal] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{
    title: string;
    message: string;
    emphasis?: string;
    iconName?: InfoModalIconName;
    actionLabel?: string;
    compact?: boolean;
    autoCloseMs?: number;
  } | null>(null);

  useEffect(() => {
    const ms = updateFeedback?.autoCloseMs;
    if (ms == null || ms <= 0) return;
    const id = setTimeout(() => setUpdateFeedback(null), ms);
    return () => clearTimeout(id);
  }, [updateFeedback]);

  useEffect(() => {
    if (settings) {
      setHour(settings.notification_hour);
      setMinute(settings.notification_minute);
      setShowSecularDate(settings.show_secular_date === 1);
      setShowCalendarDaf(settings.show_calendar_daf === 1);
      setShowConfettiPref(settings.show_confetti === 1);
      setNotificationsEnabled(settings.notifications_enabled === 1);
      setNotifMode((settings.notif_mode as 'daily' | 'custom') || 'daily');
      setThemeMode((settings.theme_mode as ThemeMode) || 'system');
      setStudyLinkMode(parseStudyLinkMode(settings.study_link_mode));
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

  const handleStudyLinkModeChange = useCallback(
    (mode: StudyLinkMode) => {
      setStudyLinkMode(mode);
      updateStudyLinkMode(mode);
    },
    [updateStudyLinkMode],
  );

  const handleCalendarDafToggle = useCallback(
    (val: boolean) => {
      setShowCalendarDaf(val);
      setShowCalendarDafEnabled(val);
    },
    [setShowCalendarDafEnabled],
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
    setUpdateFeedback({
      title: 'התראת בדיקה',
      message: 'התראת בדיקה תגיע בעוד 5 שניות',
      iconName: 'notifications-outline',
      compact: true,
      autoCloseMs: 3000,
    });
  }, []);

  const handleCheckScheduled = useCallback(async () => {
    const notifications = await getScheduledNotifications();
    setScheduledCount(notifications.length);
    setUpdateFeedback({
      title: 'התראות מתוזמנות',
      message: `יש ${notifications.length} התראות מתוזמנות במערכת`,
      iconName: 'list-outline',
      compact: true,
    });
  }, []);

  const handleUpdateAutoPromptToggle = useCallback(
    (val: boolean) => {
      setUpdateAutoPromptEnabled(val);
    },
    [setUpdateAutoPromptEnabled],
  );

  const handleCheckAppUpdates = useCallback(async () => {
    if (!isUpdateCheckConfigured()) {
      setUpdateFeedback({
        title: 'בדיקת עדכונים',
        message: 'חיבור לשרת העדכונים לא מוגדר. יש להגדיר בקובץ app.config את githubOwner ואת githubRepo.',
        iconName: 'settings-outline',
        compact: true,
      });
      return;
    }
    const r = await updateCtl.checkManualAsync();
    if (r === 'opened') return;
    if (r === 'dismissed') {
      setUpdateFeedback({
        title: 'העדכון נדחה',
        message: 'כשתפורסם גרסה חדשה יותר, נציג שוב.',
        iconName: 'time-outline',
        compact: true,
      });
      return;
    }
    const ver = Constants.expoConfig?.version;
    setUpdateFeedback({
      title: 'אין עדכון חדש',
      message: 'מותקנת אצלך הגרסה האחרונה שפורסמה.',
      emphasis: ver ? `גרסה ${ver}` : undefined,
      iconName: 'checkmark-circle',
      compact: true,
    });
  }, [updateCtl]);

  const handleSaveBackupToFile = useCallback(async () => {
    try {
      const result = await saveBackupToDevice();
      if (result.status === 'success') {
        setUpdateFeedback({
          title: 'הגיבוי נשמר',
          message: 'קובץ הגיבוי נשמר בהצלחה בתיקייה שבחרת.',
          emphasis: result.fileName,
          iconName: 'checkmark-circle',
          compact: true,
        });
      } else if (result.status === 'error') {
        setUpdateFeedback({
          title: 'שגיאה בשמירה',
          message: 'לא הצלחנו לשמור את קובץ הגיבוי. נסה שוב.',
          iconName: 'alert-circle-outline',
          compact: true,
        });
      }
    } catch {
      setUpdateFeedback({
        title: 'שגיאה בשמירה',
        message: 'לא הצלחנו לשמור את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, []);

  const handleShareBackup = useCallback(async () => {
    try {
      const result = await exportAndShareBackup();
      if (result === 'error') {
        setUpdateFeedback({
          title: 'שגיאה בשיתוף',
          message: 'לא הצלחנו ליצור את קובץ הגיבוי. נסה שוב.',
          iconName: 'alert-circle-outline',
          compact: true,
        });
      }
    } catch {
      setUpdateFeedback({
        title: 'שגיאה בשיתוף',
        message: 'לא הצלחנו ליצור את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, []);

  const handleImportBackupPick = useCallback(async () => {
    try {
      const result = await pickAndReadBackupFile();
      if (result === 'cancelled') return;
      if (!result.ok) {
        setUpdateFeedback({
          title: 'קובץ גיבוי לא תקין',
          message: result.error,
          iconName: 'alert-circle-outline',
        });
        return;
      }

      setPendingBackup(result.data);
      setBackupPreview(getBackupPreview(result.data));
      setShowBackupImportModal(true);
    } catch {
      setUpdateFeedback({
        title: 'שגיאה בייבוא',
        message: 'לא הצלחנו לקרוא את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, []);

  const clearBackupImportState = useCallback(() => {
    setShowBackupImportModal(false);
    setPendingBackup(null);
    setBackupPreview(null);
  }, []);

  const applyBackupImport = useCallback(
    async (mode: 'merge' | 'replace') => {
      if (!pendingBackup || !settings) return;

      try {
        importBackup(pendingBackup, mode);

        if (mode === 'replace') {
          setHour(pendingBackup.settings.notification_hour);
          setMinute(pendingBackup.settings.notification_minute);
          setShowSecularDate(pendingBackup.settings.show_secular_date === 1);
          setShowCalendarDaf(pendingBackup.settings.show_calendar_daf === 1);
          setShowConfettiPref(pendingBackup.settings.show_confetti === 1);
          setNotificationsEnabled(pendingBackup.settings.notifications_enabled === 1);
          setNotifMode((pendingBackup.settings.notif_mode as 'daily' | 'custom') || 'daily');
          setThemeMode((pendingBackup.settings.theme_mode as ThemeMode) || 'system');
          setStudyLinkMode(parseStudyLinkMode(pendingBackup.settings.study_link_mode));
          setDaySchedules(parseDaySchedulesJson(pendingBackup.settings.day_schedules));

          await scheduleNotifications(
            pendingBackup.settings.notification_hour,
            pendingBackup.settings.notification_minute,
            (pendingBackup.settings.notif_mode as 'daily' | 'custom') || 'daily',
            parseDaySchedulesJson(pendingBackup.settings.day_schedules),
            pendingBackup.settings.notifications_enabled === 1,
          );
        }

        clearBackupImportState();
        setUpdateFeedback({
          title: 'הגיבוי יובא בהצלחה',
          message:
            mode === 'merge'
              ? 'הנתונים מוזגו עם ההיסטוריה הקיימת.'
              : 'כל הנתונים וההגדרות הוחלפו בגיבוי.',
          iconName: 'checkmark-circle',
          compact: true,
        });
      } catch (error) {
        console.error('Backup import error:', error);
        setUpdateFeedback({
          title: 'שגיאה בייבוא',
          message: 'לא הצלחנו לייבא את הגיבוי. נסה שוב.',
          iconName: 'alert-circle-outline',
        });
      }
    },
    [pendingBackup, settings, importBackup, clearBackupImportState],
  );

  const handleBackupImportMerge = useCallback(() => {
    applyBackupImport('merge');
  }, [applyBackupImport]);

  const handleBackupImportReplace = useCallback(() => {
    applyBackupImport('replace');
  }, [applyBackupImport]);

  const handleShareDownloadLink = useCallback(async () => {
    const url = getDownloadPageUrl();
    try {
      await Share.share({
        title: 'מסע דף',
        message: `מסע דף: מעקב דף יומי בעברית\n${url}`,
        url,
      });
    } catch {
    }
  }, []);

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
            showCalendarDaf={showCalendarDaf}
            onCalendarDafToggle={handleCalendarDafToggle}
            showConfettiPref={showConfettiPref}
            onConfettiToggle={handleConfettiToggle}
            studyLinkMode={studyLinkMode}
            onStudyLinkModeChange={handleStudyLinkModeChange}
            showDevSection={__DEV__}
            scheduledCount={scheduledCount}
            onTestNotification={handleTestNotification}
            onCheckScheduled={handleCheckScheduled}
            onResetModalOpen={() => setShowResetModal(true)}
            onSaveBackupToFile={handleSaveBackupToFile}
            onShareBackup={handleShareBackup}
            onImportBackup={handleImportBackupPick}
            updateAutoPromptEnabled={updatesConfigured ? settings.update_auto_prompt_enabled === 1 : undefined}
            onUpdateAutoPromptToggle={updatesConfigured ? handleUpdateAutoPromptToggle : undefined}
            onCheckAppUpdate={updatesConfigured ? handleCheckAppUpdates : undefined}
            onProbeGithubRelease={__DEV__ ? updateCtl.probeGithubRelease : undefined}
            onShareDownloadLink={handleShareDownloadLink}
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
          showBackupImportModal={showBackupImportModal}
          backupPreview={backupPreview}
          onBackupImportMerge={handleBackupImportMerge}
          onBackupImportReplace={handleBackupImportReplace}
          onBackupImportCancel={clearBackupImportState}
          isSaving={isSaving}
        />

        <InfoModal
          compact={updateFeedback?.compact}
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
