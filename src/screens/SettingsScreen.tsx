import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import ScreenTopGradient from '../components/ScreenTopGradient';
import SettingsLoadingView from '../components/Settings/SettingsLoadingView';
import SettingsScrollContent from '../components/Settings/SettingsScrollContent';
import SettingsModals from '../components/Settings/Modals/SettingsModals';
import InfoModal from '../components/InfoModal';
import Toast from '../components/Toast';
import { createSettingsScreenStyles } from '../components/Settings/settingsScreenStyles';
import { useTheme } from '../theme';
import { useSettingsFeedback } from '../hooks/useSettingsFeedback';
import { useSettingsDisplayPrefs } from '../hooks/useSettingsDisplayPrefs';
import { useSettingsNotifications } from '../hooks/useSettingsNotifications';
import { useSettingsBackup } from '../hooks/useSettingsBackup';
import { useSettingsReset } from '../hooks/useSettingsReset';
import { useSettingsAppUpdates } from '../hooks/useSettingsAppUpdates';
import { useStorageCache } from '../hooks/useStorageCache';
import { useSettingsReaderPrefs } from '../hooks/useSettingsReaderPrefs';
import { useReaderFontSize } from '../hooks/useReaderFontSize';

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);

  const {
    settings,
    updateNotificationSettings,
    updateThemeMode,
    setUpdateAutoPromptEnabled,
    setShowCalendarDafEnabled,
    setShowPersonalTrackBannerEnabled,
    setShowSecularDateEnabled,
    setShowConfettiEnabled,
    setNotificationSoundEnabled,
    setDafDayStartMode,
    setDafDayStartTime,
    setDafDayStartSchedules,
    markBackupExported,
    importBackup,
    resetDafYomiState,
    resetPersonalTrackState,
    resetAllState,
  } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      updateNotificationSettings: s.updateNotificationSettings,
      updateThemeMode: s.updateThemeMode,
      setUpdateAutoPromptEnabled: s.setUpdateAutoPromptEnabled,
      setShowCalendarDafEnabled: s.setShowCalendarDafEnabled,
      setShowPersonalTrackBannerEnabled: s.setShowPersonalTrackBannerEnabled,
      setShowSecularDateEnabled: s.setShowSecularDateEnabled,
      setShowConfettiEnabled: s.setShowConfettiEnabled,
      setNotificationSoundEnabled: s.setNotificationSoundEnabled,
      setDafDayStartMode: s.setDafDayStartMode,
      setDafDayStartTime: s.setDafDayStartTime,
      setDafDayStartSchedules: s.setDafDayStartSchedules,
      markBackupExported: s.markBackupExported,
      importBackup: s.importBackup,
      resetDafYomiState: s.resetDafYomiState,
      resetPersonalTrackState: s.resetPersonalTrackState,
      resetAllState: s.resetAllState,
    })),
  );

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showReaderViewModal, setShowReaderViewModal] = useState(false);

  const { feedback, showFeedback, clearFeedback } = useSettingsFeedback();
  const { fontSize, increase: onIncreaseFontSize, decrease: onDecreaseFontSize } = useReaderFontSize();
  const {
    readerViewMode,
    showChavrutaNotes,
    hapticsEnabled,
    handleReaderViewModeSelect,
    handleChavrutaNotesToggle,
    handleHapticsToggle,
  } = useSettingsReaderPrefs();

  const {
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
    canApplyDafDayStartToAllDays,
    openDafDayStartModeModal,
    closeDafDayStartModeModal,
    openDafDayStartTimePicker,
    closeDafDayStartTimePicker,
    handleSecularDateToggle,
    handleConfettiToggle,
    handleCalendarDafToggle,
    handlePersonalTrackBannerToggle,
    handleThemeModeSelect,
    handleDafDayStartModeSelect,
    handleDafDayStartTimeSave,
    handleApplyDafDayStartTimeToAllDays,
    handleEditDafDayStartDay,
  } = useSettingsDisplayPrefs({
    settings,
    updateThemeMode,
    setShowCalendarDafEnabled,
    setShowPersonalTrackBannerEnabled,
    setShowSecularDateEnabled,
    setShowConfettiEnabled,
    setDafDayStartMode,
    setDafDayStartTime,
    setDafDayStartSchedules,
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
    permissionStatus,
    soundEnabled,
    scheduledCount,
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
  } = useSettingsNotifications({
    settings,
    updateNotificationSettings,
    showSecularDate,
    showConfettiPref,
    onFeedback: showFeedback,
    setNotificationSoundEnabled,
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
    markBackupExported,
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
    handleShowWhatsNew,
  } = useSettingsAppUpdates({
    onFeedback: showFeedback,
    setUpdateAutoPromptEnabled,
  });

  const {
    storageSizeFormatted,
    isClearing: isClearingStorage,
    showClearCacheModal,
    openClearCacheModal,
    closeClearCacheModal,
    handleClearCacheConfirm,
  } = useStorageCache({
    onFeedback: showFeedback,
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
            permissionStatus={permissionStatus}
            onNotificationPermissionPress={handleNotificationPermissionPress}
            notifMode={notifMode}
            onNotifModeChange={handleModeChange}
            hour={hour}
            minute={minute}
            daySchedules={daySchedules}
            onDailyTimePress={handleTimePickerOpen}
            onToggleDay={handleToggleDay}
            onEditDayTime={handleEditDayTime}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            themeMode={themeMode}
            onThemeModalOpen={() => setShowThemeModal(true)}
            dafDayStartMode={dafDayStartMode}
            dafDayStartHour={dafDayStartHour}
            dafDayStartMinute={dafDayStartMinute}
            dafDayStartSchedules={dafDayStartSchedules}
            onDafDayStartModeOpen={openDafDayStartModeModal}
            onDafDayStartTimeOpen={openDafDayStartTimePicker}
            onEditDafDayStartDay={handleEditDafDayStartDay}
            readerViewMode={readerViewMode}
            onReaderViewModePress={() => setShowReaderViewModal(true)}
            showChavrutaNotes={showChavrutaNotes}
            onChavrutaNotesToggle={handleChavrutaNotesToggle}
            hapticsEnabled={hapticsEnabled}
            onHapticsToggle={handleHapticsToggle}
            fontSize={fontSize}
            onIncreaseFontSize={onIncreaseFontSize}
            onDecreaseFontSize={onDecreaseFontSize}
            onGuideModalOpen={() => setShowGuideModal(true)}
            showSecularDate={showSecularDate}
            onSecularDateToggle={handleSecularDateToggle}
            showCalendarDaf={showCalendarDaf}
            onCalendarDafToggle={handleCalendarDafToggle}
            showPersonalTrackBannerPref={showPersonalTrackBannerPref}
            onPersonalTrackBannerToggle={handlePersonalTrackBannerToggle}
            showConfettiPref={showConfettiPref}
            onConfettiToggle={handleConfettiToggle}
            showDevSection={__DEV__}
            scheduledCount={scheduledCount}
            onTestNotification={handleTestNotification}
            onCheckScheduled={handleCheckScheduled}
            onResetModalOpen={openResetModal}
            lastBackupAt={settings.last_backup_at}
            onSaveBackupToFile={handleSaveBackupToFile}
            onShareBackup={handleShareBackup}
            onImportBackup={handleImportBackupPick}
            updateAutoPromptEnabled={updatesConfigured ? settings.update_auto_prompt_enabled === 1 : undefined}
            onUpdateAutoPromptToggle={updatesConfigured ? handleUpdateAutoPromptToggle : undefined}
            onCheckAppUpdate={updatesConfigured ? handleCheckAppUpdates : undefined}
            onShowWhatsNew={handleShowWhatsNew}
            onProbeGithubRelease={__DEV__ ? probeGithubRelease : undefined}
            onShareDownloadLink={handleShareDownloadLink}
            storageSizeFormatted={storageSizeFormatted}
            onClearCacheOpen={openClearCacheModal}
            onEmailCopied={() =>
              showFeedback({
                title: 'הכתובת הועתקה',
                message: 'אפשר להדביק אותה בכל אפליקציית דוא״ל.',
                iconName: 'copy-outline',
                toast: true,
                autoCloseMs: 2500,
              })
            }
          />
        </View>

        <SettingsModals
          themeMode={themeMode}
          showThemeModal={showThemeModal}
          onThemeModalClose={() => setShowThemeModal(false)}
          onThemeModeSelect={handleThemeModeSelect}
          dafDayStartMode={dafDayStartMode}
          showDafDayStartModeModal={showDafDayStartModeModal}
          onDafDayStartModeModalClose={closeDafDayStartModeModal}
          onDafDayStartModeSelect={handleDafDayStartModeSelect}
          showDafDayStartTimePicker={showDafDayStartTimePicker}
          onDafDayStartTimePickerClose={closeDafDayStartTimePicker}
          dafDayStartHour={dafDayStartTimePickerHour}
          dafDayStartMinute={dafDayStartTimePickerMinute}
          dafDayStartTimePickerTitle={dafDayStartTimePickerTitle}
          onDafDayStartTimeSave={handleDafDayStartTimeSave}
          onDafDayStartApplyToAllDays={
            canApplyDafDayStartToAllDays ? handleApplyDafDayStartTimeToAllDays : undefined
          }
          showGuideModal={showGuideModal}
          onGuideModalClose={() => setShowGuideModal(false)}
          showTimePicker={showTimePicker}
          onTimePickerClose={handleTimePickerClose}
          timePickerHour={editingDay !== null ? daySchedules[editingDay].hour : hour}
          timePickerMinute={editingDay !== null ? daySchedules[editingDay].minute : minute}
          onTimeSave={handleTimeSave}
          timePickerTitle={timePickerTitle}
          onTimePickerDisable={editingDay !== null ? handleDisableEditingDay : undefined}
          onTimePickerApplyToActiveDays={editingDay !== null ? handleApplyTimeToActiveDays : undefined}
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
          showClearCacheModal={showClearCacheModal}
          clearCacheSizeFormatted={storageSizeFormatted}
          isClearingCache={isClearingStorage}
          onClearCacheConfirm={handleClearCacheConfirm}
          onClearCacheClose={closeClearCacheModal}
          readerViewMode={readerViewMode}
          showReaderViewModal={showReaderViewModal}
          onReaderViewModalClose={() => setShowReaderViewModal(false)}
          onReaderViewModeSelect={handleReaderViewModeSelect}
        />

        <InfoModal
          compact={feedback?.compact}
          visible={feedback != null && !feedback.toast}
          onClose={clearFeedback}
          title={feedback?.title ?? ''}
          message={feedback?.message ?? ''}
          emphasis={feedback?.emphasis}
          iconName={feedback?.iconName}
          actionLabel={feedback?.actionLabel ?? 'הבנתי'}
          secondaryLabel={feedback?.secondaryLabel}
          onSecondary={feedback?.onSecondary}
        />
        <Toast
          visible={feedback?.toast === true}
          onClose={clearFeedback}
          title={feedback?.title ?? ''}
          message={feedback?.message ?? ''}
          iconName={feedback?.iconName}
        />
      </SafeAreaView>
    </View>
  );
}
