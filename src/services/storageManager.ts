import * as FileSystem from 'expo-file-system/legacy';

export interface StorageUsageSummary {
  totalBytes: number;
  formattedSize: string;
  tzuratHadafBytes: number;
  sefariaTextBytes: number;
  updatesBytes: number;
}

function getCacheDirectories(): string[] {
  const documentBase = FileSystem.documentDirectory ?? '';
  const cacheBase = FileSystem.cacheDirectory ?? '';

  const dirs = new Set<string>();

  if (documentBase) {
    dirs.add(`${documentBase}tzurat-hadaf/`);
    dirs.add(`${documentBase}sefaria-text/`);
  }
  if (cacheBase) {
    dirs.add(`${cacheBase}tzurat-hadaf/`);
    dirs.add(`${cacheBase}sefaria-text/`);
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

export async function getStorageUsageSummary(): Promise<StorageUsageSummary> {
  const documentBase = FileSystem.documentDirectory ?? '';
  const cacheBase = FileSystem.cacheDirectory ?? '';

  const tzuratDirs = [
    ...(documentBase ? [`${documentBase}tzurat-hadaf/`] : []),
    ...(cacheBase && cacheBase !== documentBase ? [`${cacheBase}tzurat-hadaf/`] : []),
  ];

  const sefariaDirs = [
    ...(documentBase ? [`${documentBase}sefaria-text/`] : []),
    ...(cacheBase && cacheBase !== documentBase ? [`${cacheBase}sefaria-text/`] : []),
  ];

  const updateDirs = cacheBase ? [`${cacheBase}updates/`] : [];

  const [tzuratSizes, sefariaSizes, updateSizes] = await Promise.all([
    Promise.all(tzuratDirs.map(calculateDirectoryBytes)),
    Promise.all(sefariaDirs.map(calculateDirectoryBytes)),
    Promise.all(updateDirs.map(calculateDirectoryBytes)),
  ]);

  const tzuratHadafBytes = tzuratSizes.reduce((acc, curr) => acc + curr, 0);
  const sefariaTextBytes = sefariaSizes.reduce((acc, curr) => acc + curr, 0);
  const updatesBytes = updateSizes.reduce((acc, curr) => acc + curr, 0);
  const totalBytes = tzuratHadafBytes + sefariaTextBytes + updatesBytes;

  return {
    totalBytes,
    formattedSize: formatStorageBytes(totalBytes),
    tzuratHadafBytes,
    sefariaTextBytes,
    updatesBytes,
  };
}

export async function clearStorageCache(): Promise<void> {
  const dirs = getCacheDirectories();
  const deletePromises = dirs.map(async (dirPath) => {
    try {
      const info = await FileSystem.getInfoAsync(dirPath);
      if (info.exists) {
        await FileSystem.deleteAsync(dirPath, { idempotent: true });
      }
    } catch {}
  });

  await Promise.all(deletePromises);
}
