import * as FileSystem from 'expo-file-system/legacy';

import { invalidateChavrutaMemoryCache } from './chavrutaApi';
import { invalidateSefariaChaptersMemoryCache } from './sefariaChapters';

export interface StorageUsageSummary {
  totalBytes: number;
  formattedSize: string;
  sefariaTextBytes: number;
  chavrutaBytes: number;
  updatesBytes: number;
}

function getLegacyTzuratDirectories(): string[] {
  const documentBase = FileSystem.documentDirectory ?? '';
  const cacheBase = FileSystem.cacheDirectory ?? '';
  const dirs: string[] = [];
  if (documentBase) dirs.push(`${documentBase}tzurat-hadaf/`);
  if (cacheBase && cacheBase !== documentBase) dirs.push(`${cacheBase}tzurat-hadaf/`);
  return dirs;
}

function getCacheDirectories(): string[] {
  const documentBase = FileSystem.documentDirectory ?? '';
  const cacheBase = FileSystem.cacheDirectory ?? '';
  const dirs = new Set<string>(getLegacyTzuratDirectories());

  if (documentBase) {
    dirs.add(`${documentBase}sefaria-text/`);
    dirs.add(`${documentBase}chavruta/`);
  }
  if (cacheBase) {
    dirs.add(`${cacheBase}sefaria-text/`);
    dirs.add(`${cacheBase}chavruta/`);
    dirs.add(`${cacheBase}updates/`);
  }

  return Array.from(dirs);
}

export function formatStorageBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function calculateDirectoryBytes(dirPath: string): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      return 0;
    }

    const fileNames = await FileSystem.readDirectoryAsync(dirPath);
    const sizePromises = fileNames.map(async (fileName) => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(`${dirPath}${fileName}`);
        return fileInfo.exists ? fileInfo.size ?? 0 : 0;
      } catch {
        return 0;
      }
    });

    const sizes = await Promise.all(sizePromises);
    return sizes.reduce((acc, curr) => acc + curr, 0);
  } catch {
    return 0;
  }
}

async function deleteDirectories(dirs: string[]): Promise<void> {
  await Promise.all(
    dirs.map(async (dirPath) => {
      try {
        const info = await FileSystem.getInfoAsync(dirPath);
        if (info.exists) {
          await FileSystem.deleteAsync(dirPath, { idempotent: true });
        }
      } catch {
      }
    }),
  );
}

export async function deleteLegacyTzuratHadafCache(): Promise<void> {
  await deleteDirectories(getLegacyTzuratDirectories());
  const accessIndexPath = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}tzurat-hadaf-access.json`;
  try {
    const info = await FileSystem.getInfoAsync(accessIndexPath);
    if (info.exists) {
      await FileSystem.deleteAsync(accessIndexPath, { idempotent: true });
    }
  } catch {
  }
}

export async function getStorageUsageSummary(): Promise<StorageUsageSummary> {
  const documentBase = FileSystem.documentDirectory ?? '';
  const cacheBase = FileSystem.cacheDirectory ?? '';

  const sefariaDirs = [
    ...(documentBase ? [`${documentBase}sefaria-text/`] : []),
    ...(cacheBase && cacheBase !== documentBase ? [`${cacheBase}sefaria-text/`] : []),
  ];

  const chavrutaDirs = [
    ...(documentBase ? [`${documentBase}chavruta/`] : []),
    ...(cacheBase && cacheBase !== documentBase ? [`${cacheBase}chavruta/`] : []),
  ];

  const updateDirs = cacheBase ? [`${cacheBase}updates/`] : [];

  const [sefariaSizes, chavrutaSizes, updateSizes] = await Promise.all([
    Promise.all(sefariaDirs.map(calculateDirectoryBytes)),
    Promise.all(chavrutaDirs.map(calculateDirectoryBytes)),
    Promise.all(updateDirs.map(calculateDirectoryBytes)),
  ]);

  const sefariaTextBytes = sefariaSizes.reduce((acc, curr) => acc + curr, 0);
  const chavrutaBytes = chavrutaSizes.reduce((acc, curr) => acc + curr, 0);
  const updatesBytes = updateSizes.reduce((acc, curr) => acc + curr, 0);
  const totalBytes = sefariaTextBytes + chavrutaBytes + updatesBytes;

  return {
    totalBytes,
    formattedSize: formatStorageBytes(totalBytes),
    sefariaTextBytes,
    chavrutaBytes,
    updatesBytes,
  };
}

export async function clearStorageCache(): Promise<void> {
  invalidateChavrutaMemoryCache();
  invalidateSefariaChaptersMemoryCache();
  await deleteDirectories(getCacheDirectories());
}
