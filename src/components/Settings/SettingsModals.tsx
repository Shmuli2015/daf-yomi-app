import React from 'react';
import { ThemeMode } from '../../theme';
import SettingsChoiceModal from './SettingsChoiceModal';
import { GuideModal } from './GuideModal';
import { TimePickerModal } from './TimePickerModal';
import ResetOptionsModal from './ResetOptionsModal';
import { ResetOptionType } from './ResetOptionsModal.types';
import SuccessModal from '../SuccessModal';
import ResetConfirmModal from './ResetConfirmModal';
import BackupImportModal from './BackupImportModal';
import type { BackupPreview } from '../../services/backup';
import ClearCacheModal from './ClearCacheModal';
import type { ViewMode } from '../SefariaReader/ReaderToolbar';

export type SettingsModalsProps = {
  themeMode: ThemeMode;
  showThemeModal: boolean;
  onThemeModalClose: () => void;
  onThemeModeSelect: (mode: ThemeMode) => void;
  showGuideModal: boolean;
  onGuideModalClose: () => void;
  showTimePicker: boolean;
  onTimePickerClose: () => void;
  timePickerHour: number;
  timePickerMinute: number;
  onTimeSave: (hour: number, minute: number) => void;
  timePickerTitle?: string;
  onTimePickerDisable?: () => void;
  onTimePickerApplyToActiveDays?: (hour: number, minute: number) => void;
  showResetModal: boolean;
  onResetModalClose: () => void;
  onConfirmReset: (type: ResetOptionType) => void;
  showResetConfirmModal: boolean;
  resetConfirmTitle: string;
  resetConfirmMessage: string;
  onResetConfirmClose: () => void;
  onExecuteReset: () => void;
  showSuccessModal: boolean;
  resetSuccessTitle?: string;
  resetSuccessMessage?: string;
  onSuccessModalClose: () => void;
  showBackupImportModal: boolean;
  backupPreview: BackupPreview | null;
  onBackupImportMerge: () => void;
  onBackupImportReplace: () => void;
  onBackupImportCancel: () => void;
  showClearCacheModal?: boolean;
  clearCacheSizeFormatted?: string;
  isClearingCache?: boolean;
  onClearCacheConfirm?: () => void;
  onClearCacheClose?: () => void;
  readerViewMode: ViewMode;
  showReaderViewModal: boolean;
  onReaderViewModalClose: () => void;
  onReaderViewModeSelect: (mode: ViewMode) => void;
};

export default function SettingsModals({
  themeMode,
  showThemeModal,
  onThemeModalClose,
  onThemeModeSelect,
  showGuideModal,
  onGuideModalClose,
  showTimePicker,
  onTimePickerClose,
  timePickerHour,
  timePickerMinute,
  onTimeSave,
  timePickerTitle,
  onTimePickerDisable,
  onTimePickerApplyToActiveDays,
  showResetModal,
  onResetModalClose,
  onConfirmReset,
  showResetConfirmModal,
  resetConfirmTitle,
  resetConfirmMessage,
  onResetConfirmClose,
  onExecuteReset,
  showSuccessModal,
  resetSuccessTitle,
  resetSuccessMessage,
  onSuccessModalClose,
  showBackupImportModal,
  backupPreview,
  onBackupImportMerge,
  onBackupImportReplace,
  onBackupImportCancel,
  showClearCacheModal = false,
  clearCacheSizeFormatted = '0 B',
  isClearingCache = false,
  onClearCacheConfirm,
  onClearCacheClose,
  readerViewMode,
  showReaderViewModal,
  onReaderViewModalClose,
  onReaderViewModeSelect,
}: SettingsModalsProps) {
  return (
    <>
      <SettingsChoiceModal
        visible={showThemeModal}
        title="בחירת מצב תצוגה"
        headerIcon="color-palette-outline"
        value={themeMode}
        options={[
          { value: 'system', label: 'לפי תצוגת המערכת', icon: 'contrast-outline' },
          { value: 'dark', label: 'מצב כהה', icon: 'moon-outline' },
          { value: 'light', label: 'מצב בהיר', icon: 'sunny-outline' },
        ]}
        onClose={onThemeModalClose}
        onSelect={onThemeModeSelect}
      />
      <SettingsChoiceModal
        visible={showReaderViewModal}
        title="בחירת מצב קורא"
        headerIcon="reader-outline"
        value={readerViewMode}
        options={[
          { value: 'classic', label: 'גמרא', icon: 'book-outline' },
          { value: 'steinsaltz', label: 'שטיינזלץ', icon: 'reader-outline' },
          { value: 'chavruta', label: 'חברותא', icon: 'people-outline' },
        ]}
        onClose={onReaderViewModalClose}
        onSelect={onReaderViewModeSelect}
      />
      <GuideModal visible={showGuideModal} onClose={onGuideModalClose} />
      <TimePickerModal
        visible={showTimePicker}
        onClose={onTimePickerClose}
        hour={timePickerHour}
        minute={timePickerMinute}
        onSave={onTimeSave}
        title={timePickerTitle}
        onDisable={onTimePickerDisable}
        onApplyToActiveDays={onTimePickerApplyToActiveDays}
      />
      <ResetOptionsModal
        visible={showResetModal}
        onConfirm={onConfirmReset}
        onClose={onResetModalClose}
      />
      <ResetConfirmModal
        visible={showResetConfirmModal}
        title={resetConfirmTitle}
        message={resetConfirmMessage}
        onConfirm={onExecuteReset}
        onClose={onResetConfirmClose}
      />
      <SuccessModal
        visible={showSuccessModal}
        title={resetSuccessTitle || 'האיפוס הושלם'}
        message={resetSuccessMessage || 'הנתונים נמחקו בהצלחה. האפליקציה חזרה למצבה ההתחלתי.'}
        onClose={onSuccessModalClose}
      />
      <BackupImportModal
        visible={showBackupImportModal}
        preview={backupPreview}
        onMerge={onBackupImportMerge}
        onReplace={onBackupImportReplace}
        onCancel={onBackupImportCancel}
      />
      <ClearCacheModal
        visible={showClearCacheModal}
        formattedSize={clearCacheSizeFormatted}
        isClearing={isClearingCache}
        onClose={onClearCacheClose || (() => {})}
        onConfirm={onClearCacheConfirm || (() => {})}
      />
    </>
  );
}
