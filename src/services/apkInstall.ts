import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

const UPDATES_DIR = `${FileSystem.cacheDirectory ?? ''}updates/`;

export type DownloadProgress = {
  totalBytes: number;
  downloadedBytes: number;
  progress: number;
};

export type ApkInstallErrorCode =
  | 'not_android'
  | 'download_failed'
  | 'install_failed'
  | 'permission_needed';

export class ApkInstallError extends Error {
  code: ApkInstallErrorCode;

  constructor(code: ApkInstallErrorCode, message: string) {
    super(message);
    this.name = 'ApkInstallError';
    this.code = code;
  }
}

export function getDownloadPageUrl(): string {
  const extra = Constants.expoConfig?.extra as { downloadPageUrl?: string } | undefined;
  return extra?.downloadPageUrl ?? 'https://shmuli2015.github.io/daf-yomi-app/';
}

async function ensureUpdatesDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(UPDATES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(UPDATES_DIR, { intermediates: true });
  }
}

export async function cleanupOldApkDownloads(keepFileName?: string): Promise<void> {
  try {
    await ensureUpdatesDir();
    const names = await FileSystem.readDirectoryAsync(UPDATES_DIR);
    await Promise.all(
      names
        .filter(name => name.endsWith('.apk') && name !== keepFileName)
        .map(name => FileSystem.deleteAsync(`${UPDATES_DIR}${name}`, { idempotent: true })),
    );
  } catch {
    /* cache cleanup is best-effort */
  }
}

export async function downloadApk(
  url: string,
  fileName: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<string> {
  await ensureUpdatesDir();
  await cleanupOldApkDownloads(fileName);

  const localUri = `${UPDATES_DIR}${fileName}`;
  const callback = onProgress
    ? (data: FileSystem.DownloadProgressData) => {
        const total =
          data.totalBytesExpectedToWrite > 0 ? data.totalBytesExpectedToWrite : 0;
        onProgress({
          totalBytes: total,
          downloadedBytes: data.totalBytesWritten,
          progress: total > 0 ? data.totalBytesWritten / total : 0,
        });
      }
    : undefined;

  const resumable = FileSystem.createDownloadResumable(url, localUri, {}, callback);
  const result = await resumable.downloadAsync();
  if (!result?.uri) {
    throw new ApkInstallError('download_failed', 'ההורדה נכשלה. נסו שוב או הורידו מהדפדפן.');
  }
  return result.uri;
}

export async function installDownloadedApk(localUri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new ApkInstallError('not_android', 'התקנה זמינה רק באנדרואיד.');
  }

  try {
    const contentUri = await FileSystem.getContentUriAsync(localUri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1,
      type: 'application/vnd.android.package-archive',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/unknown sources|install packages|REQUEST_INSTALL/i.test(msg)) {
      throw new ApkInstallError(
        'permission_needed',
        'יש לאשר «התקנה ממקורות לא ידועים» עבור מסע דף.',
      );
    }
    throw new ApkInstallError('install_failed', 'לא הצלחנו לפתוח את מסך ההתקנה.');
  }
}

export async function openUnknownSourcesSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const pkg = Constants.expoConfig?.android?.package ?? 'com.shmuli.dafyomi';
  try {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_UNKNOWN_APP_SOURCES, {
      data: `package:${pkg}`,
    });
  } catch {
    await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES');
  }
}

export async function downloadAndInstallApk(
  url: string,
  fileName: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  const localUri = await downloadApk(url, fileName, onProgress);
  await installDownloadedApk(localUri);
}
