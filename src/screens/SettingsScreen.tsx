import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Share, AppState, Platform } from 'react-native';
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
import { sendTestNotification, getScheduledNotifications, scheduleNotifications } from '../utils/notifications';
import { parseStudyLinkMode, type StudyLinkMode } from '../utils/studyLinkMode';
import { useAppUpdateControls } from '../context/AppUpdateProvider';
import { isUpdateCheckConfigured } from '../services/appUpdate';
import { getDownloadPageUrl } from '../services/apkInstall';
import { useSettingsNotifications } from '../hooks/useSettingsNotifications';
import { useSettingsBackup } from '../hooks/useSettingsBackup';
import type { BackupData } from '../services/backup';

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);
  const updateCtl = useAppUpdateControls();

  const {
    settings,
    updateNotificationSettings,
    updateThemeMode,
    updateStudyLinkMode,
    loadInitialData,
    setUpdateAutoPromptEnabled,
    setShowCalendarDafEnabled,
    setShowPersonalTrackBannerEnabled,
    importBackup,
  } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      updateNotificationSettings: s.updateNotificationSettings,
      updateThemeMode: s.updateThemeMode,
      updateStudyLinkMode: s.updateStudyLinkMode,
      loadInitialData: s.loadInitialData,
      setUpdateAutoPromptEnabled: s.setUpdateAutoPromptEnabled,
      setShowCalendarDafEnabled: s.setShowCalendarDafEnabled,
      setShowPersonalTrackBannerEnabled: s.setShowPersonalTrackBannerEnabled,
      importBackup: s.importBackup,
    })),
  );

  const [showSecularDate, setShowSecularDate] = useState(true);
  const [showCalendarDaf, setShowCalendarDaf] = useState(false);
  const [showPersonalTrackBannerPref, setShowPersonalTrackBannerPref] = useState(true);
  const [showConfettiPref, setShowConfettiPref] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [studyLinkMode, setStudyLinkMode] = useState<StudyLinkMode>('both');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

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
      setShowSecularDate(settings.show_secular_date === 1);
      setShowCalendarDaf(settings.show_calendar_daf === 1);
      setShowPersonalTrackBannerPref(settings.show_personal_track_banner !== 0);
      setShowConfettiPref(settings.show_confetti === 1);
      setThemeMode((settings.theme_mode as ThemeMode) || 'system');
      setStudyLinkMode(parseStudyLinkMode(settings.study_link_mode));
    }
  }, [settings]);

  const {
    hour,
    minute,
    notificationsEnabled,
    notifMode,
    daySchedules,
    editingDay,
    showTimePicker,
    exactAlarmStatus,
    isSaving,
    refreshExactAlarmStatus,
    handleModeChange,
    handleToggleDay,
    handleEditDayTime,
    handleTimeSave,
    handleNotificationsToggle,
    handleExactAlarmSettingsPress,
    handleTimePickerOpen,
    handleTimePickerClose,
  } = useSettingsNotifications({
    settings,
    updateNotificationSettings,
    showSecularDate,
    showConfettiPref,
  });

  const handleApplyBackup = useCallback(
    async (backup: BackupData, mode: 'merge' | 'replace') => {
      importBackup(backup, mode);
      if (mode === 'replace') {
        await scheduleNotifications(
          backup.settings.notification_hour,
          backup.settings.notification_minute,
          (backup.settings.notif_mode as 'daily' | 'custom') || 'daily',
          JSON.parse(backup.settings.day_schedules || '[]'),
          backup.settings.notifications_enabled === 1,
        );
      }
      setUpdateFeedback({
        title: 'הגיבוי יובא בהצלחה',
        message:
          mode === 'merge'
            ? 'הנתונים מוזגו עם ההיסטוריה הקיימת.'
            : 'כל הנתונים וההגדרות הוחלפו בגיבוי.',
        iconName: 'checkmark-circle',
        compact: true,
      });
    },
    [importBackup],
  );

  const {
    backupPreview,
    showBackupImportModal,
    clearBackupImportState,
    handleSaveBackupToFile,
    handleShareBackup,
    handleImportBackupPick,
    handleBackupImportMerge,
    handleBackupImportReplace,
  } = useSettingsBackup({
    onFeedback: setUpdateFeedback,
    onApplyBackup: handleApplyBackup,
  });

  const onConfirmReset = useCallback(() => {
    resetDB();
    loadInitialData();
    setShowResetModal(false);
    setShowSuccessModal(true);
  }, [loadInitialData]);

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

  const handlePersonalTrackBannerToggle = useCallback(
    (val: boolean) => {
      setShowPersonalTrackBannerPref(val);
      setShowPersonalTrackBannerEnabled(val);
    },
    [setShowPersonalTrackBannerEnabled],
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
        message: 'דחיתם את העדכון הנוכחי. כשתופיע גרסה חדשה יותר, נזכיר שוב.',
        iconName: 'time-outline',
        compact: true,
      });
      return;
    }
    const ver = Constants.expoConfig?.version;
    setUpdateFeedback({
      title: 'הכל מעודכן',
      message: 'אתם כבר על הגרסה העדכנית ביותר של מסע דף.',
      emphasis: ver ? `גרסה ${ver}` : undefined,
      iconName: 'checkmark-circle',
      compact: true,
    });
  }, [updateCtl]);

  const handleShareDownloadLink = useCallback(async () => {
    const url = getDownloadPageUrl();
    try {
      await Share.share({
        title: 'מסע דף',
        message: `מסע דף: מעקב דף יומי בעברית\n${url}`,
        url,
      });
    } catch {}
  }, []);

  const updatesConfigured = isUpdateCheckConfigured();

  useEffect(() => {
    async function checkScheduled() {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    }
    checkScheduled();
  }, [notificationsEnabled, hour, minute, notifMode, daySchedules]);

  useEffect(() => {
    void refreshExactAlarmStatus();
  }, [refreshExactAlarmStatus]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        void refreshExactAlarmStatus();
      }
    });

    return () => sub.remove();
  }, [refreshExactAlarmStatus]);

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
            exactAlarmStatus={exactAlarmStatus}
            onExactAlarmSettingsPress={handleExactAlarmSettingsPress}
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
            showPersonalTrackBannerPref={showPersonalTrackBannerPref}
            onPersonalTrackBannerToggle={handlePersonalTrackBannerToggle}
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
