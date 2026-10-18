import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { getSettings } from '../db/database';
import { autoBackupIssueMessage, normalizeAutoBackupIssue } from '../utils/autoBackupIssue';
import {
  disableAutoBackup,
  enableAutoBackupWithPicker,
  enableExistingAutoBackup,
  updateAutoBackupInterval,
} from '../services/autoBackup';
import {
  saveBackupToDevice,
  exportAndShareBackup,
  pickAndReadBackupFile,
  getBackupPreview,
  type BackupData,
  type BackupPreview,
} from '../services/backup';
import { useAppStore } from '../store/useAppStore';
import type { AutoBackupInterval } from '../utils/autoBackupInterval';
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

  const refreshSettings = useCallback(() => {
    useAppStore.getState().refreshSettings();
  }, []);

  const handleAutoBackupToggle = useCallback(async (enabled: boolean) => {
    if (Platform.OS !== 'android') return;
    if (!enabled) {
      disableAutoBackup();
      refreshSettings();
      return;
    }

    const settings = getSettings();
    const hasFolder = Boolean(settings.auto_backup_file_uri);
    try {
      const result = hasFolder
        ? await enableExistingAutoBackup()
        : await enableAutoBackupWithPicker();
      refreshSettings();
      if (result === 'cancelled') return;
      const issue = normalizeAutoBackupIssue(getSettings().auto_backup_issue);
      if (result === 'enabled') {
        onFeedback({
          title: issue === 'restored' ? 'קובץ הגיבוי נשמר מחדש' : 'הגיבוי האוטומטי הופעל',
          message:
            issue === 'restored'
              ? autoBackupIssueMessage(issue) ?? ''
              : hasFolder
                ? 'הגיבוי יתעדכן בתיקייה שנבחרה לפי התדירות שבהגדרות.'
                : 'קובץ הגיבוי נשמר בתיקייה שבחרת, ויתעדכן לפי התדירות שבהגדרות.',
          iconName: 'checkmark-circle',
          compact: true,
        });
        return;
      }
      onFeedback({
        title: issue === 'missing' || issue === 'missing_previous' ? 'קובץ הגיבוי לא נמצא' : 'שגיאה בגיבוי אוטומטי',
        message:
          autoBackupIssueMessage(issue) ??
          'לא הצלחנו לשמור את קובץ הגיבוי. בחר תיקייה אחרת ונסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    } catch {
      refreshSettings();
      onFeedback({
        title: 'שגיאה בגיבוי אוטומטי',
        message: 'לא הצלחנו לשמור את קובץ הגיבוי. בחר תיקייה אחרת ונסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, [onFeedback, refreshSettings]);

  const handleAutoBackupIntervalChange = useCallback((interval: AutoBackupInterval) => {
    updateAutoBackupInterval(interval);
    refreshSettings();
  }, [refreshSettings]);

  const handleChangeAutoBackupFolder = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try {
      const result = await enableAutoBackupWithPicker();
      refreshSettings();
      if (result === 'cancelled') return;
      if (result === 'enabled') {
        onFeedback({
          title: 'תיקיית הגיבוי עודכנה',
          message: 'קובץ הגיבוי נשמר בתיקייה החדשה.',
          iconName: 'checkmark-circle',
          compact: true,
        });
        return;
      }
      onFeedback({
        title: 'שגיאה בגיבוי אוטומטי',
        message: 'לא הצלחנו לשמור את קובץ הגיבוי. בחר תיקייה אחרת ונסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    } catch {
      refreshSettings();
      onFeedback({
        title: 'שגיאה בגיבוי אוטומטי',
        message: 'לא הצלחנו לשמור את קובץ הגיבוי. בחר תיקייה אחרת ונסה שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    }
  }, [onFeedback, refreshSettings]);

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
    handleAutoBackupToggle,
    handleAutoBackupIntervalChange,
    handleChangeAutoBackupFolder,
    handleSaveBackupToFile,
    handleShareBackup,
    handleImportBackupPick,
    handleBackupImportMerge,
    handleBackupImportReplace,
  };
}
