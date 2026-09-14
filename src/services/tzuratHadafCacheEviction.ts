import * as FileSystem from 'expo-file-system/legacy';

export const TZURAT_HADAF_CACHE_MAX_BYTES = 100 * 1024 * 1024;

const ACCESS_INDEX_PATH = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}tzurat-hadaf-access.json`;

export type CacheFileRecord = {
  path: string;
  size: number;
  lastUsedMs: number;
};

function getTzuratHadafCacheDirectories(): string[] {
  const documentBase = FileSystem.documentDirectory ?? '';
  const cacheBase = FileSystem.cacheDirectory ?? '';
  const dirs: string[] = [];
  if (documentBase) {
    dirs.push(`${documentBase}tzurat-hadaf/`);
  }
  if (cacheBase && cacheBase !== documentBase) {
    dirs.push(`${cacheBase}tzurat-hadaf/`);
  }
  return dirs;
}

function isCachedPageFile(name: string): boolean {
  return name.endsWith('.pdf') || name.endsWith('.jpg');
}

export function pickFilesToEvict(
  files: CacheFileRecord[],
  maxBytes: number,
  keepPath?: string,
): string[] {
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total <= maxBytes) {
    return [];
  }

  const sorted = [...files].sort((a, b) => {
    if (a.lastUsedMs !== b.lastUsedMs) {
      return a.lastUsedMs - b.lastUsedMs;
    }
    return a.path.localeCompare(b.path);
  });

  let remaining = total;
  const toDelete: string[] = [];
  for (const file of sorted) {
    if (remaining <= maxBytes) {
      break;
    }
    if (keepPath && file.path === keepPath) {
      continue;
    }
    toDelete.push(file.path);
    remaining -= file.size;
  }
  return toDelete;
}

async function readAccessIndex(): Promise<Record<string, number>> {
  try {
    const info = await FileSystem.getInfoAsync(ACCESS_INDEX_PATH);
    if (!info.exists) {
      return {};
    }
    const raw = await FileSystem.readAsStringAsync(ACCESS_INDEX_PATH);
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, number> = {};
    for (const [path, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[path] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function writeAccessIndex(index: Record<string, number>): Promise<void> {
  await FileSystem.writeAsStringAsync(ACCESS_INDEX_PATH, JSON.stringify(index));
}

export async function touchTzuratHadafAccess(path: string): Promise<void> {
  try {
    const index = await readAccessIndex();
    index[path] = Date.now();
    await writeAccessIndex(index);
  } catch {}
}

async function listCacheFileRecords(): Promise<CacheFileRecord[]> {
  const accessIndex = await readAccessIndex();
  const dirs = getTzuratHadafCacheDirectories();
  const records: CacheFileRecord[] = [];

  for (const dir of dirs) {
    try {
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        continue;
      }
      const names = await FileSystem.readDirectoryAsync(dir);
      for (const name of names) {
        if (!isCachedPageFile(name)) {
          continue;
        }
        const path = `${dir}${name}`;
        try {
          const info = await FileSystem.getInfoAsync(path);
          if (!info.exists || info.isDirectory) {
            continue;
          }
          const size = info.size ?? 0;
          if (size <= 0) {
            continue;
          }
          const modificationMs =
            typeof info.modificationTime === 'number' && Number.isFinite(info.modificationTime)
              ? info.modificationTime * 1000
              : 0;
          records.push({
            path,
            size,
            lastUsedMs: accessIndex[path] ?? modificationMs,
          });
        } catch {}
      }
    } catch {}
  }

  return records;
}

export async function enforceTzuratHadafCacheLimit(keepPath?: string): Promise<void> {
  try {
    const files = await listCacheFileRecords();
    const toDelete = pickFilesToEvict(files, TZURAT_HADAF_CACHE_MAX_BYTES, keepPath);
    if (toDelete.length === 0) {
      return;
    }

    await Promise.all(
      toDelete.map(path => FileSystem.deleteAsync(path, { idempotent: true })),
    );

    const index = await readAccessIndex();
    let changed = false;
    for (const path of toDelete) {
      if (path in index) {
        delete index[path];
        changed = true;
      }
    }
    if (changed) {
      await writeAccessIndex(index);
    }
  } catch {}
}
