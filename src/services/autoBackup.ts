import { Directory, File } from 'expo-file-system';
import { Platform } from 'react-native';
import {
  getSettings,
  saveAutoBackupLocation,
  setAutoBackupEnabled,
  setAutoBackupFailed,
  setAutoBackupInterval,
  setLastBackupAt,
} from '../db/database';
import { isAutoBackupDue, type AutoBackupInterval } from '../utils/autoBackupInterval';
import { rotateAndWriteBackup, type BackupFileAccess } from '../utils/autoBackupWrite';
import { buildBackupData } from './backup';

export const AUTO_BACKUP_FILE_NAME = 'masa-daf-backup.json';
export const AUTO_BACKUP_PREVIOUS_FILE_NAME = 'masa-daf-backup-previous.json';

export type AutoBackupRunResult = 'skipped' | 'written' | 'failed';
export type AutoBackupEnableResult = 'enabled' | 'cancelled' | 'error';

let backupQueue: Promise<void> = Promise.resolve();

function withBackupWriteLock<T>(work: () => Promise<T>): Promise<T> {
  const run = backupQueue.then(work, work);
  backupQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function isUserCancel(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message: unknown }).message) : '';
  return (
    message.includes('cancel') ||
    message.includes('Cancel') ||
    message.includes('dismissed')
  );
}

function fileAccess(uri: string): BackupFileAccess {
  const file = new File(uri);
  return {
    get exists() {
      return file.exists;
    },
    read() {
      return file.textSync();
    },
    write(content: string) {
      file.write(content);
    },
  };
}

function displayNameFromUri(uri: string): string | null {
  try {
    const decoded = decodeURIComponent(uri);
    const slash = Math.max(decoded.lastIndexOf('/'), decoded.lastIndexOf(':'));
    const name = slash >= 0 ? decoded.slice(slash + 1) : decoded;
    return name || null;
  } catch {
    return null;
  }
}

function findOrCreateFile(directory: Directory, name: string): File {
  const existing = directory
    .list()
    .find(entry => entry instanceof File && displayNameFromUri(entry.uri) === name);
  if (existing instanceof File) return existing;
  return directory.createFile(name, 'application/json');
}

function writeBoundFiles(currentUri: string, previousUri: string): boolean {
  const json = JSON.stringify(buildBackupData(), null, 2);
  const result = rotateAndWriteBackup(fileAccess(currentUri), fileAccess(previousUri), json);
  if (result !== 'written') return false;
  saveAutoBackupLocation(currentUri, previousUri);
  setLastBackupAt(new Date().toISOString());
  return true;
}

export function disableAutoBackup() {
  setAutoBackupEnabled(false);
  setAutoBackupFailed(false);
}

export function updateAutoBackupInterval(interval: AutoBackupInterval) {
  setAutoBackupInterval(interval);
}

export async function enableAutoBackupWithPicker(): Promise<AutoBackupEnableResult> {
  if (Platform.OS !== 'android') return 'error';
  let directory: Directory;
  try {
    directory = await Directory.pickDirectoryAsync();
  } catch (error) {
    if (isUserCancel(error)) return 'cancelled';
    return 'error';
  }

  return withBackupWriteLock(async () => {
    try {
      const current = findOrCreateFile(directory, AUTO_BACKUP_FILE_NAME);
      const previous = findOrCreateFile(directory, AUTO_BACKUP_PREVIOUS_FILE_NAME);
      return writeBoundFiles(current.uri, previous.uri) ? 'enabled' : 'error';
    } catch {
      return 'error';
    }
  });
}

export async function enableExistingAutoBackup(): Promise<AutoBackupEnableResult> {
  if (Platform.OS !== 'android') return 'error';
  try {
    const settings = getSettings();
    if (!settings.auto_backup_file_uri || !settings.auto_backup_previous_file_uri) return 'error';
    setAutoBackupEnabled(true);
    const current = new File(settings.auto_backup_file_uri);
    if (!current.exists) {
      setAutoBackupFailed(true);
      return 'error';
    }
    setAutoBackupFailed(false);
    const result = await runAutoBackupIfDue();
    return result === 'failed' ? 'error' : 'enabled';
  } catch {
    setAutoBackupFailed(true);
    return 'error';
  }
}

export function runAutoBackupIfDue(): Promise<AutoBackupRunResult> {
  if (Platform.OS !== 'android') return Promise.resolve('skipped');
  return withBackupWriteLock(async () => {
    try {
      const settings = getSettings();
      if (settings.auto_backup_enabled !== 1) return 'skipped';
      const currentUri = settings.auto_backup_file_uri;
      const previousUri = settings.auto_backup_previous_file_uri;
      if (!currentUri || !previousUri) {
        setAutoBackupFailed(true);
        return 'failed';
      }
      if (!isAutoBackupDue(settings.last_backup_at, settings.auto_backup_interval)) {
        return 'skipped';
      }
      if (!writeBoundFiles(currentUri, previousUri)) {
        setAutoBackupFailed(true);
        return 'failed';
      }
      return 'written';
    } catch {
      setAutoBackupFailed(true);
      return 'failed';
    }
  });
}
