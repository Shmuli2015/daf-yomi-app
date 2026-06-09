import Constants from 'expo-constants';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale/he';
import * as DocumentPicker from 'expo-document-picker';
import { Directory } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import {
  getAllRecords,
  getSettings,
  type DailyRecord,
  type SettingsRecord,
} from '../db/database';
import { toFileSharingUrl } from '../utils/shareProgressImage';

export const CURRENT_BACKUP_VERSION = 1;

export type BackupRecord = Omit<DailyRecord, 'id'>;
export type BackupSettings = Omit<SettingsRecord, 'id'>;

export type BackupData = {
  backupVersion: number;
  exportedAt: string;
  appVersion: string;
  records: BackupRecord[];
  settings: BackupSettings;
};

export type BackupPreview = {
  learnedCount: number;
  totalRecords: number;
  lastLearnedDate: string | null;
  lastLearnedLabel: string | null;
  exportedAtLabel: string;
};

export type BackupParseResult =
  | { ok: true; data: BackupData }
  | { ok: false; error: string };

function stripRecordId(record: DailyRecord): BackupRecord {
  const { id: _id, ...rest } = record;
  return rest;
}

function stripSettingsId(settings: SettingsRecord): BackupSettings {
  const { id: _id, ...rest } = settings;
  return rest;
}

export function buildBackupData(): BackupData {
  return {
    backupVersion: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    records: getAllRecords().map(stripRecordId),
    settings: stripSettingsId(getSettings()),
  };
}

function isRecordStatus(value: unknown): value is DailyRecord['status'] {
  return value === 'learned' || value === 'partial' || value === 'missed';
}

function validateBackupRecord(raw: unknown): BackupRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.date !== 'string' || !r.date) return null;
  if (!isRecordStatus(r.status)) return null;
  if (typeof r.learnedAt !== 'string' || !r.learnedAt) return null;

  return {
    date: r.date,
    masechet: typeof r.masechet === 'string' ? r.masechet : '',
    daf: typeof r.daf === 'string' ? r.daf : '',
    status: r.status,
    percentage: typeof r.percentage === 'number' ? r.percentage : 0,
    notes: typeof r.notes === 'string' ? r.notes : '',
    learnedAt: r.learnedAt,
  };
}

function validateBackupSettings(raw: unknown): BackupSettings | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;

  const num = (key: string, fallback: number) =>
    typeof s[key] === 'number' ? (s[key] as number) : fallback;
  const str = (key: string, fallback: string) =>
    typeof s[key] === 'string' ? (s[key] as string) : fallback;
  const nullableStr = (key: string) =>
    s[key] == null ? null : typeof s[key] === 'string' ? (s[key] as string) : null;

  return {
    notification_hour: num('notification_hour', 7),
    notification_minute: num('notification_minute', 30),
    show_secular_date: num('show_secular_date', 1),
    show_confetti: num('show_confetti', 1),
    notifications_enabled: num('notifications_enabled', 1),
    notif_mode: str('notif_mode', 'daily'),
    day_schedules: nullableStr('day_schedules'),
    theme_mode: str('theme_mode', 'system'),
    last_update_check_at: nullableStr('last_update_check_at'),
    dismissed_update_version: nullableStr('dismissed_update_version'),
    update_auto_prompt_enabled: num('update_auto_prompt_enabled', 0),
    study_link_mode: str('study_link_mode', 'both'),
    show_calendar_daf: num('show_calendar_daf', 0),
  };
}

function migrateBackup(raw: Record<string, unknown>): BackupData | null {
  const version =
    typeof raw.backupVersion === 'number'
      ? raw.backupVersion
      : typeof raw.schemaVersion === 'number'
        ? raw.schemaVersion
        : 1;

  if (version > CURRENT_BACKUP_VERSION) {
    return null;
  }

  if (!Array.isArray(raw.records)) return null;
  const records: BackupRecord[] = [];
  for (const item of raw.records) {
    const record = validateBackupRecord(item);
    if (!record) return null;
    records.push(record);
  }

  const settings = validateBackupSettings(raw.settings);
  if (!settings) return null;

  return {
    backupVersion: version,
    exportedAt:
      typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date(0).toISOString(),
    appVersion: typeof raw.appVersion === 'string' ? raw.appVersion : 'unknown',
    records,
    settings,
  };
}

export function parseBackupJson(json: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'הקובץ אינו בפורמט JSON תקין.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'מבנה הגיבוי אינו תקין.' };
  }

  const data = migrateBackup(parsed as Record<string, unknown>);
  if (!data) {
    return { ok: false, error: 'לא ניתן לקרוא את קובץ הגיבוי. ייתכן שהוא פגום או מגרסה חדשה מדי.' };
  }

  return { ok: true, data };
}

function formatBackupDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return format(parseISO(dateStr), 'd בMMMM yyyy', { locale: he });
  } catch {
    return dateStr;
  }
}

export function getBackupPreview(data: BackupData): BackupPreview {
  const learned = data.records.filter(r => r.status === 'learned');
  const sorted = [...learned].sort((a, b) => b.date.localeCompare(a.date));
  const lastLearnedDate = sorted[0]?.date ?? null;

  let exportedAtLabel = 'לא ידוע';
  try {
    exportedAtLabel = format(parseISO(data.exportedAt), 'd בMMMM yyyy', { locale: he });
  } catch {
    exportedAtLabel = data.exportedAt;
  }

  return {
    learnedCount: learned.length,
    totalRecords: data.records.length,
    lastLearnedDate,
    lastLearnedLabel: formatBackupDate(lastLearnedDate),
    exportedAtLabel,
  };
}

function backupFileName(): string {
  const datePart = format(new Date(), 'yyyy-MM-dd');
  return `masa-daf-backup-${datePart}.json`;
}

function isUserCancel(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message: unknown }).message) : '';
  return (
    message.includes('cancel') ||
    message.includes('Cancel') ||
    message.includes('User did not share') ||
    message.includes('dismissed')
  );
}

export type BackupExportResult =
  | { status: 'success'; fileName: string }
  | { status: 'cancelled' }
  | { status: 'error' };

export async function saveBackupToDevice(): Promise<BackupExportResult> {
  try {
    const backup = buildBackupData();
    const json = JSON.stringify(backup, null, 2);
    const directory = await Directory.pickDirectoryAsync();
    const baseName = backupFileName();

    let savedFileName = baseName;
    let file;
    try {
      file = directory.createFile(baseName, 'application/json');
    } catch {
      savedFileName = `masa-daf-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
      file = directory.createFile(savedFileName, 'application/json');
    }

    file.write(json);
    return { status: 'success', fileName: savedFileName };
  } catch (error) {
    if (isUserCancel(error)) {
      return { status: 'cancelled' };
    }
    return { status: 'error' };
  }
}

export async function exportAndShareBackup(): Promise<'success' | 'cancelled' | 'error'> {
  try {
    const backup = buildBackupData();
    const json = JSON.stringify(backup, null, 2);
    const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
    if (!baseDir) {
      return 'error';
    }

    const dest = `${baseDir}${backupFileName()}`;
    await FileSystem.writeAsStringAsync(dest, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const shareUrl = toFileSharingUrl(dest);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(shareUrl, {
        mimeType: 'application/json',
        dialogTitle: 'ייצוא גיבוי מסע דף',
        UTI: 'public.json',
      });
    } else {
      await Share.share({
        title: 'גיבוי מסע דף',
        message: json,
        url: shareUrl,
      });
    }

    return 'success';
  } catch (error) {
    if (isUserCancel(error)) {
      return 'cancelled';
    }
    return 'error';
  }
}

export async function pickAndReadBackupFile(): Promise<
  { ok: true; data: BackupData } | { ok: false; error: string } | 'cancelled'
> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return 'cancelled';
    }

    const uri = result.assets[0].uri;
    const json = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsed = parseBackupJson(json);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }

    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: 'לא הצלחנו לקרוא את הקובץ. נסה שוב.' };
  }
}
