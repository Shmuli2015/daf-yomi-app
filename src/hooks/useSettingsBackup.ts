import { useState, useCallback } from 'react';
import {
  saveBackupToDevice,
  exportAndShareBackup,
  pickAndReadBackupFile,
  getBackupPreview,
  type BackupData,
  type BackupPreview,
} from '../services/backup';
import type { InfoModalIconName } from '../components/InfoModal';

interface FeedbackState {
  title: string;
  message: string;
  emphasis?: string;
  iconName?: InfoModalIconName;
  compact?: boolean;
}

interface UseSettingsBackupParams {
  onFeedback: (feedback: FeedbackState) => void;
  onApplyBackup: (backup: BackupData, mode: 'merge' | 'replace') => Promise<void>;
}

export function useSettingsBackup({
  onFeedback,
  onApplyBackup,
}: UseSettingsBackupParams) {
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [showBackupImportModal, setShowBackupImportModal] = useState(false);

  const clearBackupImportState = useCallback(() => {
    setShowBackupImportModal(false);
    setPendingBackup(null);
    setBackupPreview(null);
  }, []);

  const handleSaveBackupToFile = useCallback(async () => {
    try {
      const result = await saveBackupToDevice();
      if (result.status === 'success') {
        onFeedback({
          title: 'הגיבוי נשמר',
          message: 'קובץ הגיבוי נשמר בהצלחה בתיקייה שבחרת.',
          emphasis: result.fileName,
          iconName: 'checkmark-circle',
          compact: true,
        });
      } else if (result.status === 'error') {
        onFeedback({
          title: 'שגיאה בשמירה',
          message: 'לא הצלחנו לשמור את קובץ הגיבוי. נסה שוב.',
          iconName: 'alert-circle-outline',
          compact: true,
        });
      }
    } catch {
      onFeedback({
        title: 'שגיאה בשמירה',
        message: 'לא הצלחנו לשמור את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, [onFeedback]);

  const handleShareBackup = useCallback(async () => {
    try {
      const result = await exportAndShareBackup();
      if (result === 'error') {
        onFeedback({
          title: 'שגיאה בשיתוף',
          message: 'לא הצלחנו ליצור את קובץ הגיבוי. נסה שוב.',
          iconName: 'alert-circle-outline',
          compact: true,
        });
      }
    } catch {
      onFeedback({
        title: 'שגיאה בשיתוף',
        message: 'לא הצלחנו ליצור את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, [onFeedback]);

  const handleImportBackupPick = useCallback(async () => {
    try {
      const result = await pickAndReadBackupFile();
      if (result === 'cancelled') return;
      if (!result.ok) {
        onFeedback({
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
      onFeedback({
        title: 'שגיאה בייבוא',
        message: 'לא הצלחנו לקרוא את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, [onFeedback]);

  const handleBackupImportMerge = useCallback(async () => {
    if (!pendingBackup) return;
    await onApplyBackup(pendingBackup, 'merge');
    clearBackupImportState();
  }, [pendingBackup, onApplyBackup, clearBackupImportState]);

  const handleBackupImportReplace = useCallback(async () => {
    if (!pendingBackup) return;
    await onApplyBackup(pendingBackup, 'replace');
    clearBackupImportState();
  }, [pendingBackup, onApplyBackup, clearBackupImportState]);

  return {
    pendingBackup,
    backupPreview,
    showBackupImportModal,
    clearBackupImportState,
    handleSaveBackupToFile,
    handleShareBackup,
    handleImportBackupPick,
    handleBackupImportMerge,
    handleBackupImportReplace,
  };
}
