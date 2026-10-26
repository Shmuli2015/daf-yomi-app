function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

export function computeBackupChecksum(payload: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x9e3779b9;
  for (let i = 0; i < payload.length; i++) {
    const charCode = payload.charCodeAt(i);
    hash1 ^= charCode;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 = Math.imul(hash2 ^ charCode, 0x5bd1e995);
  }
  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `${h1}${h2}`;
}

export function buildBackupCanonicalPayload(
  records: unknown[],
  settings: unknown,
  personalTrackRecords?: unknown[],
): string {
  return JSON.stringify({
    p: sortObjectKeys(personalTrackRecords ?? []),
    r: sortObjectKeys(records),
    s: sortObjectKeys(settings),
  });
}
