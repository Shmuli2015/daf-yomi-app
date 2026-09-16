import { useState, useCallback } from 'react';
import {
  saveBackupToDevice,
  exportAndShareBackup,
  pickAndReadBackupFile,
  getBackupPreview,
  type BackupData,
  type BackupPreview,
} from '../services/backup';
import { scheduleNotifications } from '../utils/notifications';
import type { SettingsFeedback } from './useSettingsFeedback';

interface UseSettingsBackupParams {
  onFeedback: (feedback: SettingsFeedback) => void;
  importBackup: (backup: BackupData, mode: 'merge' | 'replace') => void;
  markBackupExported: () => void;
}

export function useSettingsBackup({
  onFeedback,
  importBackup,
  markBackupExported,
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
        markBackupExported();
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
  }, [onFeedback, markBackupExported]);

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
      } else if (result === 'success') {
        markBackupExported();
      }
    } catch {
      onFeedback({
        title: 'שגיאה בשיתוף',
        message: 'לא הצלחנו ליצור את קובץ הגיבוי. נסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, [onFeedback, markBackupExported]);

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

  const applyBackup = useCallback(
    async (backup: BackupData, mode: 'merge' | 'replace') => {
      importBackup(backup, mode);
      if (mode === 'replace') {
        await scheduleNotifications(
          backup.settings.notification_hour,
          backup.settings.notification_minute,
          (backup.settings.notif_mode as 'daily' | 'custom') || 'daily',
          JSON.parse(backup.settings.day_schedules || '[]'),
          backup.settings.notifications_enabled === 1,
          { sound: backup.settings.notification_sound_enabled !== 0 },
        );
      }
      onFeedback({
        title: 'הגיבוי יובא בהצלחה',
        message:
          mode === 'merge'
            ? 'הנתונים מוזגו עם ההיסטוריה הקיימת.'
            : 'כל הנתונים וההגדרות הוחלפו בגיבוי.',
        iconName: 'checkmark-circle',
        compact: true,
      });
    },
    [importBackup, onFeedback],
  );

  const handleBackupImportMerge = useCallback(async () => {
    if (!pendingBackup) return;
    await applyBackup(pendingBackup, 'merge');
    clearBackupImportState();
  }, [pendingBackup, applyBackup, clearBackupImportState]);

  const handleBackupImportReplace = useCallback(async () => {
    if (!pendingBackup) return;
    await applyBackup(pendingBackup, 'replace');
    clearBackupImportState();
  }, [pendingBackup, applyBackup, clearBackupImportState]);

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
