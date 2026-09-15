import * as FileSystem from 'expo-file-system/legacy';
import {
  buildChavrutaUrl,
  getChavrutaSource,
} from '../data/chavrutaSources';
import { normalizeMasechetEn, type Amud } from '../utils/dafNavigation';
import { resolveChavrutaLocation } from '../utils/mishnahOnlySefaria';
import {
  findChavrutaAmud,
  parseChavrutaDocument,
  type ChavrutaAmud,
} from '../utils/parseChavrutaHtml';
import { decodeHtmlBytes } from '../utils/windows1255';

export type {
  ChavrutaAmud,
  ChavrutaBlock,
  ChavrutaFootnote,
  ChavrutaParagraph,
} from '../utils/parseChavrutaHtml';

export const CHAVRUTA_CACHE_VERSION = 6;

export interface ChavrutaPageData extends ChavrutaAmud {
  masechetEn: string;
}

interface ChavrutaMasechetCache {
  v: number;
  masechetEn: string;
  amudim: ChavrutaAmud[];
}

interface FetchChavrutaAmudOptions {
  forceRefresh?: boolean;
}

const CACHE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}chavruta/`;
const memoryCache = new Map<string, ChavrutaMasechetCache>();
const inFlight = new Map<string, Promise<ChavrutaMasechetCache>>();

async function ensureCacheDir(): Promise<string> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
  return CACHE_DIR;
}

function getCacheFilePath(masechetEn: string): string {
  const safeName = masechetEn.replace(/\s+/g, '_');
  return `${CACHE_DIR}${safeName}.json`;
}

export function invalidateChavrutaMemoryCache(masechetEn?: string): void {
  if (masechetEn) {
    const normalized = normalizeMasechetEn(masechetEn);
    memoryCache.delete(normalized);
    inFlight.delete(normalized);
    return;
  }

  memoryCache.clear();
  inFlight.clear();
}

async function readCachedMasechet(masechetEn: string): Promise<ChavrutaMasechetCache | null> {
  const cachePath = getCacheFilePath(masechetEn);
  try {
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (!fileInfo.exists || (fileInfo.size ?? 0) < 100) {
      return null;
    }
    const content = await FileSystem.readAsStringAsync(cachePath);
    const parsed = JSON.parse(content) as ChavrutaMasechetCache;
    if (
      parsed?.v === CHAVRUTA_CACHE_VERSION &&
      parsed.masechetEn === masechetEn &&
      Array.isArray(parsed.amudim) &&
      parsed.amudim.length > 0
    ) {
      return parsed;
    }
  } catch {
  }
  return null;
}

async function writeCachedMasechet(cache: ChavrutaMasechetCache): Promise<void> {
  try {
    await ensureCacheDir();
    await FileSystem.writeAsStringAsync(getCacheFilePath(cache.masechetEn), JSON.stringify(cache));
  } catch {
  }
}

async function deleteCachedMasechet(masechetEn: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(getCacheFilePath(masechetEn), { idempotent: true });
  } catch {
  }
}

async function fetchMasechetFromNetwork(masechetEn: string): Promise<ChavrutaMasechetCache> {
  const source = getChavrutaSource(masechetEn);
  if (!source) {
    throw new Error('אין ביאור חברותא למסכת זו');
  }

  const response = await fetch(buildChavrutaUrl(source));
  if (!response.ok) {
    throw new Error('לא ניתן לטעון את ביאור חברותא. בדקו את החיבור לרשת.');
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const html = decodeHtmlBytes(bytes);
  const amudim = parseChavrutaDocument(html);
  if (amudim.length === 0) {
    throw new Error('לא ניתן לפענח את ביאור חברותא למסכת זו');
  }

  return {
    v: CHAVRUTA_CACHE_VERSION,
    masechetEn,
    amudim,
  };
}

async function loadMasechet(
  masechetEn: string,
  forceRefresh = false
): Promise<ChavrutaMasechetCache> {
  if (forceRefresh) {
    invalidateChavrutaMemoryCache(masechetEn);
    await deleteCachedMasechet(masechetEn);
  } else {
    const remembered = memoryCache.get(masechetEn);
    if (remembered) {
      return remembered;
    }

    const pending = inFlight.get(masechetEn);
    if (pending) {
      return pending;
    }
  }

  const promise = (async () => {
    const cached = forceRefresh ? null : await readCachedMasechet(masechetEn);
    if (cached) {
      memoryCache.set(masechetEn, cached);
      return cached;
    }

    const fetched = await fetchMasechetFromNetwork(masechetEn);
    memoryCache.set(masechetEn, fetched);
    await writeCachedMasechet(fetched);
    return fetched;
  })();

  inFlight.set(masechetEn, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(masechetEn);
  }
}

export async function fetchChavrutaAmud(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  options: FetchChavrutaAmudOptions = {}
): Promise<ChavrutaPageData> {
  const resolved = resolveChavrutaLocation(masechetEn, dafNum, amud);
  const normalized = normalizeMasechetEn(resolved.masechetEn);
  if (!getChavrutaSource(normalized)) {
    throw new Error('אין ביאור חברותא למסכת זו');
  }

  const masechet = await loadMasechet(normalized, options.forceRefresh === true);
  const page = findChavrutaAmud(masechet.amudim, resolved.dafNum, resolved.amud);
  if (!page) {
    throw new Error('לא נמצא ביאור חברותא לעמוד זה');
  }

  return {
    ...page,
    masechetEn: normalized,
  };
}

export async function clearChavrutaCache(): Promise<void> {
  invalidateChavrutaMemoryCache();
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
  } catch {
  }
}
