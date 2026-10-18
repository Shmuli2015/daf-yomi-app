import { Directory, File } from 'expo-file-system';
import { Platform } from 'react-native';
import {
  getSettings,
  saveAutoBackupLocation,
  setAutoBackupEnabled,
  setAutoBackupInterval,
  setAutoBackupIssue,
  setLastBackupAt,
} from '../db/database';
import { isAutoBackupDue, type AutoBackupInterval } from '../utils/autoBackupInterval';
import { normalizeAutoBackupIssue, type AutoBackupIssue } from '../utils/autoBackupIssue';
import { rotateAndWriteBackup, type BackupFileAccess } from '../utils/autoBackupWrite';
import { buildBackupData } from './backup';

export const AUTO_BACKUP_FILE_NAME = 'masa-daf-backup.json';
export const AUTO_BACKUP_PREVIOUS_FILE_NAME = 'masa-daf-backup-previous.json';

export type AutoBackupRunResult = 'skipped' | 'written' | 'failed' | 'restored' | 'cleared';
export type AutoBackupEnableResult = 'enabled' | 'cancelled' | 'error';

let backupQueue: Promise<void> = Promise.resolve();
let restoredInThisProcess = false;

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

function readExisting(uri: string): string | null {
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    return file.textSync();
  } catch {
    return null;
  }
}

function previousForRotation(currentUri: string, previousUri: string | null, existing: string): {
  uri: string | null;
  access: BackupFileAccess;
} {
  if (existing.length === 0) {
    const keptUri = previousUri && fileExists(previousUri) ? previousUri : null;
    return {
      uri: keptUri,
      access: {
        exists: false,
        read: () => '',
        write() {
          throw new Error('previous file is not created without an older backup');
        },
      },
    };
  }
  const uri =
    previousUri && fileExists(previousUri)
      ? previousUri
      : findOrCreateFile(new File(currentUri).parentDirectory, AUTO_BACKUP_PREVIOUS_FILE_NAME).uri;
  return { uri, access: fileAccess(uri) };
}

function writeBoundFiles(currentUri: string, previousUri: string | null): boolean {
  const existing = readExisting(currentUri);
  if (existing === null) return false;
  const previous = previousForRotation(currentUri, previousUri, existing);
  const json = JSON.stringify(buildBackupData(), null, 2);
  const result = rotateAndWriteBackup(fileAccess(currentUri), previous.access, json);
  if (result !== 'written') return false;
  saveAutoBackupLocation(currentUri, previous.uri);
  setLastBackupAt(new Date().toISOString());
  return true;
}

function fileExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

function missingIssue(previousUri: string | null): 'missing' | 'missing_previous' {
  return previousUri && fileExists(previousUri) ? 'missing_previous' : 'missing';
}

function markIssue(issue: AutoBackupIssue | null) {
  if (issue === 'restored') restoredInThisProcess = true;
  setAutoBackupIssue(issue);
}

function recreateMissingBackup(currentUri: string, previousUri: string | null): boolean {
  try {
    const directory = new File(currentUri).parentDirectory;
    if (!directory.exists) return false;
    const nextCurrent = findOrCreateFile(directory, AUTO_BACKUP_FILE_NAME);
    const keptPrevious = previousUri && fileExists(previousUri) ? previousUri : null;
    return writeBoundFiles(nextCurrent.uri, keptPrevious);
  } catch {
    return false;
  }
}

function restoreMissingBackup(currentUri: string, previousUri: string | null): boolean {
  if (!recreateMissingBackup(currentUri, previousUri)) {
    markIssue(missingIssue(previousUri));
    return false;
  }
  markIssue('restored');
  return true;
}

function clearResolvedIssue(issue: AutoBackupIssue | null): boolean {
  if (issue === 'restored' && !restoredInThisProcess) {
    markIssue(null);
    return true;
  }
  if (issue === 'missing' || issue === 'missing_previous') {
    markIssue(null);
    return true;
  }
  return false;
}

export function disableAutoBackup() {
  setAutoBackupEnabled(false);
  setAutoBackupIssue(null);
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
      return writeBoundFiles(current.uri, null) ? 'enabled' : 'error';
    } catch {
      return 'error';
    }
  });
}

async function performAutoBackup(): Promise<AutoBackupRunResult> {
  const settings = getSettings();
  if (settings.auto_backup_enabled !== 1) return 'skipped';
  const currentUri = settings.auto_backup_file_uri;
  const previousUri = settings.auto_backup_previous_file_uri;
  if (!currentUri) {
    markIssue('failed');
    return 'failed';
  }
  const issue = normalizeAutoBackupIssue(settings.auto_backup_issue);
  if (!fileExists(currentUri)) {
    return restoreMissingBackup(currentUri, previousUri) ? 'restored' : 'failed';
  }
  const cleared = clearResolvedIssue(issue);
  if (!isAutoBackupDue(settings.last_backup_at, settings.auto_backup_interval)) {
    return cleared ? 'cleared' : 'skipped';
  }
  if (!writeBoundFiles(currentUri, previousUri)) {
    if (!fileExists(currentUri)) {
      return restoreMissingBackup(currentUri, previousUri) ? 'restored' : 'failed';
    }
    markIssue('failed');
    return 'failed';
  }
  return 'written';
}

export async function enableExistingAutoBackup(): Promise<AutoBackupEnableResult> {
  if (Platform.OS !== 'android') return 'error';
  return withBackupWriteLock(async () => {
    try {
      const settings = getSettings();
      if (!settings.auto_backup_file_uri) return 'error';
      setAutoBackupEnabled(true);
      if (!fileExists(settings.auto_backup_file_uri)) {
        return restoreMissingBackup(
          settings.auto_backup_file_uri,
          settings.auto_backup_previous_file_uri,
        )
          ? 'enabled'
          : 'error';
      }
      clearResolvedIssue(normalizeAutoBackupIssue(settings.auto_backup_issue));
      const result = await performAutoBackup();
      return result === 'failed' ? 'error' : 'enabled';
    } catch {
      setAutoBackupIssue('failed');
      return 'error';
    }
  });
}

export function runAutoBackupIfDue(): Promise<AutoBackupRunResult> {
  if (Platform.OS !== 'android') return Promise.resolve('skipped');
  return withBackupWriteLock(async () => {
    try {
      return await performAutoBackup();
    } catch {
      setAutoBackupIssue('failed');
      return 'failed';
    }
  });
}
