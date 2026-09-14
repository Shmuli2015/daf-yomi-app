import * as FileSystem from 'expo-file-system/legacy';
import {
  enforceTzuratHadafCacheLimit,
  touchTzuratHadafAccess,
} from './tzuratHadafCacheEviction';

export const MIN_PDF_BYTES = 2048;
export const MIN_IMAGE_BYTES = 1024;

function getPersistentDir(): string {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return `${base}tzurat-hadaf/`;
}

function getLegacyCacheDir(): string {
  const base = FileSystem.cacheDirectory ?? '';
  return `${base}tzurat-hadaf/`;
}

export function tzuratHadafFileName(tref: string, extension: 'pdf' | 'jpg'): string {
  return `${tref.replace(/\./g, '_')}.${extension}`;
}

export function tzuratHadafPaths(tref: string, extension: 'pdf' | 'jpg'): string[] {
  const fileName = tzuratHadafFileName(tref, extension);
  const dirs = [getPersistentDir()];
  const legacy = getLegacyCacheDir();
  if (legacy !== dirs[0]) {
    dirs.push(legacy);
  }
  return dirs.map((dir) => `${dir}${fileName}`);
}

export async function ensureTzuratHadafDir(): Promise<string> {
  const dir = getPersistentDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function findTzuratHadafFile(
  tref: string,
  extension: 'pdf' | 'jpg',
  minBytes: number
): Promise<string | null> {
  for (const path of tzuratHadafPaths(tref, extension)) {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists && (info.size ?? 0) >= minBytes) {
      void touchTzuratHadafAccess(path);
      return path;
    }
  }
  return null;
}

async function validateDownloadedFile(path: string, minBytes: number): Promise<string> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists || (info.size ?? 0) < minBytes) {
    await FileSystem.deleteAsync(path, { idempotent: true });
    throw new Error('Download produced an invalid file');
  }
  return path;
}

async function validateAndTrimCache(path: string, minBytes: number): Promise<string> {
  const validPath = await validateDownloadedFile(path, minBytes);
  try {
    await touchTzuratHadafAccess(validPath);
    await enforceTzuratHadafCacheLimit(validPath);
  } catch {}
  return validPath;
}

export async function downloadTzuratHadafFile(
  tref: string,
  extension: 'pdf' | 'jpg',
  remoteUrl: string
): Promise<string> {
  const dir = await ensureTzuratHadafDir();
  const path = `${dir}${tzuratHadafFileName(tref, extension)}`;
  const minBytes = extension === 'pdf' ? MIN_PDF_BYTES : MIN_IMAGE_BYTES;

  const existing = await findTzuratHadafFile(tref, extension, minBytes);
  if (existing) return existing;

  if ((await FileSystem.getInfoAsync(path)).exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }

  try {
    const result = await FileSystem.downloadAsync(remoteUrl, path);
    return validateAndTrimCache(result.uri, minBytes);
  } catch {
    const resumable = FileSystem.createDownloadResumable(remoteUrl, path);
    const result = await resumable.downloadAsync();
    if (!result?.uri) {
      throw new Error('Download failed');
    }
    return validateAndTrimCache(result.uri, minBytes);
  }
}

export async function deleteTzuratHadafFile(
  tref: string,
  extension: 'pdf' | 'jpg'
): Promise<void> {
  await Promise.all(
    tzuratHadafPaths(tref, extension).map((path) =>
      FileSystem.deleteAsync(path, { idempotent: true })
    )
  );
}
