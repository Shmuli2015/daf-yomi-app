import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import ScreenTopGradient from '../components/ScreenTopGradient';
import SettingsLoadingView from '../components/Settings/SettingsLoadingView';
import SettingsScrollContent from '../components/Settings/SettingsScrollContent';
import SettingsModals from '../components/Settings/SettingsModals';
import InfoModal from '../components/InfoModal';
import { createSettingsScreenStyles } from '../components/Settings/settingsScreenStyles';
import { useTheme } from '../theme';
import { useSettingsFeedback } from '../hooks/useSettingsFeedback';
import { useSettingsDisplayPrefs } from '../hooks/useSettingsDisplayPrefs';
import { useSettingsNotifications } from '../hooks/useSettingsNotifications';
import { useSettingsBackup } from '../hooks/useSettingsBackup';
import { useSettingsReset } from '../hooks/useSettingsReset';
import { useSettingsAppUpdates } from '../hooks/useSettingsAppUpdates';

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);

  const {
    settings,
    updateNotificationSettings,
    updateThemeMode,
    updateStudyLinkMode,
    setUpdateAutoPromptEnabled,
    setShowCalendarDafEnabled,
    setShowPersonalTrackBannerEnabled,
    importBackup,
    resetDafYomiState,
    resetPersonalTrackState,
    resetAllState,
  } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      updateNotificationSettings: s.updateNotificationSettings,
      updateThemeMode: s.updateThemeMode,
      updateStudyLinkMode: s.updateStudyLinkMode,
      setUpdateAutoPromptEnabled: s.setUpdateAutoPromptEnabled,
      setShowCalendarDafEnabled: s.setShowCalendarDafEnabled,
      setShowPersonalTrackBannerEnabled: s.setShowPersonalTrackBannerEnabled,
      importBackup: s.importBackup,
      resetDafYomiState: s.resetDafYomiState,
      resetPersonalTrackState: s.resetPersonalTrackState,
      resetAllState: s.resetAllState,
    })),
  );

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const { feedback, showFeedback, clearFeedback } = useSettingsFeedback();

  const {
    showSecularDate,
    showCalendarDaf,
    showPersonalTrackBannerPref,
    showConfettiPref,
    themeMode,
    studyLinkMode,
    handleSecularDateToggle,
    handleConfettiToggle,
    handleCalendarDafToggle,
    handlePersonalTrackBannerToggle,
    handleThemeModeSelect,
    handleStudyLinkModeChange,
  } = useSettingsDisplayPrefs({
    settings,
    updateNotificationSettings,
    updateThemeMode,
    updateStudyLinkMode,
    setShowCalendarDafEnabled,
    setShowPersonalTrackBannerEnabled,
  });

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
    scheduledCount,
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
  } = useSettingsNotifications({
    settings,
    updateNotificationSettings,
    showSecularDate,
    showConfettiPref,
    onFeedback: showFeedback,
  });

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
    onFeedback: showFeedback,
    importBackup,
  });

  const {
    showResetModal,
    showResetConfirmModal,
    showSuccessModal,
    resetConfirmTexts,
    resetSuccessFeedback,
    openResetModal,
    closeResetModal,
    closeSuccessModal,
    handleSelectResetOption,
    handleCancelResetConfirm,
    handleExecuteReset,
  } = useSettingsReset({
    resetDafYomiState,
    resetPersonalTrackState,
    resetAllState,
  });

  const {
    updatesConfigured,
    probeGithubRelease,
    handleUpdateAutoPromptToggle,
    handleCheckAppUpdates,
    handleShareDownloadLink,
  } = useSettingsAppUpdates({
    onFeedback: showFeedback,
    setUpdateAutoPromptEnabled,
  });

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
            onResetModalOpen={openResetModal}
            onSaveBackupToFile={handleSaveBackupToFile}
            onShareBackup={handleShareBackup}
            onImportBackup={handleImportBackupPick}
            updateAutoPromptEnabled={updatesConfigured ? settings.update_auto_prompt_enabled === 1 : undefined}
            onUpdateAutoPromptToggle={updatesConfigured ? handleUpdateAutoPromptToggle : undefined}
            onCheckAppUpdate={updatesConfigured ? handleCheckAppUpdates : undefined}
            onProbeGithubRelease={__DEV__ ? probeGithubRelease : undefined}
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
          onResetModalClose={closeResetModal}
          onConfirmReset={handleSelectResetOption}
          showResetConfirmModal={showResetConfirmModal}
          resetConfirmTitle={resetConfirmTexts.title}
          resetConfirmMessage={resetConfirmTexts.message}
          onResetConfirmClose={handleCancelResetConfirm}
          onExecuteReset={handleExecuteReset}
          showSuccessModal={showSuccessModal}
          resetSuccessTitle={resetSuccessFeedback?.title}
          resetSuccessMessage={resetSuccessFeedback?.message}
          onSuccessModalClose={closeSuccessModal}
          showBackupImportModal={showBackupImportModal}
          backupPreview={backupPreview}
          onBackupImportMerge={handleBackupImportMerge}
          onBackupImportReplace={handleBackupImportReplace}
          onBackupImportCancel={clearBackupImportState}
          isSaving={isSaving}
        />

        <InfoModal
          compact={feedback?.compact}
          visible={feedback != null}
          onClose={clearFeedback}
          title={feedback?.title ?? ''}
          message={feedback?.message ?? ''}
          emphasis={feedback?.emphasis}
          iconName={feedback?.iconName}
          actionLabel={feedback?.actionLabel ?? 'הבנתי'}
        />
      </SafeAreaView>
    </View>
  );
}
