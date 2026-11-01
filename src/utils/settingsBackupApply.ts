import type { SettingsFeedback } from '../hooks/useSettingsFeedback';
import type { BackupData } from '../services/backup';
import { captureException } from '../services/sentry';
import { scheduleNotifications } from './notifications';
import {
  reminderModeFromSettings,
  schedulesForReminderSettings,
} from './reminderSchedule';

export type BackupImportMode = 'merge' | 'replace';

export type ApplyImportedBackupResult = {
  imported: boolean;
  feedback: SettingsFeedback;
};

export const BACKUP_IMPORT_FAILURE_FEEDBACK: SettingsFeedback = {
  title: 'שגיאה בייבוא',
  message: 'לא הצלחנו לייבא את קובץ הגיבוי. הנתונים הקיימים לא שונו.',
  iconName: 'alert-circle-outline',
  compact: true,
};

export function backupImportFeedback(
  mode: BackupImportMode,
  scheduleFailed: boolean,
): SettingsFeedback {
  if (mode === 'merge') {
    return {
      title: 'הגיבוי יובא בהצלחה',
      message: 'הנתונים מוזגו עם ההיסטוריה הקיימת.',
      iconName: 'checkmark-circle',
      compact: true,
    };
  }
  if (scheduleFailed) {
    return {
      title: 'הגיבוי יובא בהצלחה',
      message:
        'כל הנתונים וההגדרות הוחלפו בגיבוי. לא הצלחנו לתזמן מחדש את התזכורות. אפשר לשמור שוב את שעת התזכורת בהגדרות.',
      iconName: 'alert-circle-outline',
      compact: true,
    };
  }
  return {
    title: 'הגיבוי יובא בהצלחה',
    message: 'כל הנתונים וההגדרות הוחלפו בגיבוי.',
    iconName: 'checkmark-circle',
    compact: true,
  };
}

export async function applyImportedBackup(
  backup: BackupData,
  mode: BackupImportMode,
  importBackup: (data: BackupData, importMode: BackupImportMode) => void,
): Promise<ApplyImportedBackupResult> {
  try {
    importBackup(backup, mode);
  } catch (error) {
    captureException(error);
    return { imported: false, feedback: BACKUP_IMPORT_FAILURE_FEEDBACK };
  }

  let scheduleFailed = false;
  if (mode === 'replace') {
    try {
      const reminderMode = reminderModeFromSettings(backup.settings.notif_mode);
      await scheduleNotifications(
        backup.settings.notification_hour,
        backup.settings.notification_minute,
        reminderMode,
        schedulesForReminderSettings(backup.settings.day_schedules, reminderMode),
        backup.settings.notifications_enabled === 1,
        { sound: backup.settings.notification_sound_enabled !== 0 },
      );
    } catch {
      scheduleFailed = true;
    }
  }

  return {
    imported: true,
    feedback: backupImportFeedback(mode, scheduleFailed),
  };
}
