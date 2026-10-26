import * as FileSystem from 'expo-file-system/legacy';
import {
  buildChavrutaUrl,
  getChavrutaSource,
} from '../data/chavrutaSources';
import { normalizeMasechetEn, type Amud } from '../utils/dafNavigation';
import { resolveChavrutaLocation } from '../utils/mishnahOnlySefaria';
import {
  findChavrutaAmud,
  parseChavrutaAmudFromHtml,
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

export const CHAVRUTA_CACHE_VERSION = 9;

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
const rawHtml = new Map<string, string>();
const htmlInFlight = new Map<string, Promise<string>>();
const fullParseInFlight = new Map<string, Promise<ChavrutaMasechetCache>>();
const parseTokens = new Map<string, { cancelled: boolean }>();
const writeChain = new Map<string, Promise<void>>();

function cancelParseToken(masechetEn?: string): void {
  if (masechetEn) {
    const token = parseTokens.get(masechetEn);
    if (token) {
      token.cancelled = true;
    }
    parseTokens.delete(masechetEn);
    return;
  }

  for (const token of parseTokens.values()) {
    token.cancelled = true;
  }
  parseTokens.clear();
}

function enqueueMasechetWrite(masechetEn: string, work: () => Promise<void>): Promise<void> {
  const previous = writeChain.get(masechetEn) ?? Promise.resolve();
  const next = previous.then(work, work);
  writeChain.set(
    masechetEn,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}

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
    cancelParseToken(normalized);
    memoryCache.delete(normalized);
    rawHtml.delete(normalized);
    htmlInFlight.delete(normalized);
    fullParseInFlight.delete(normalized);
    return;
  }

  cancelParseToken();
  memoryCache.clear();
  rawHtml.clear();
  htmlInFlight.clear();
  fullParseInFlight.clear();
}

export async function hasCachedChavrutaMasechet(masechetEn: string): Promise<boolean> {
  const normalized = normalizeMasechetEn(masechetEn);
  if (!getChavrutaSource(normalized)) {
    return false;
  }
  if (memoryCache.has(normalized)) {
    return true;
  }
  const cached = await readCachedMasechet(normalized);
  if (cached) {
    memoryCache.set(normalized, cached);
    return true;
  }
  return false;
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

async function fetchMasechetHtml(masechetEn: string): Promise<string> {
  const source = getChavrutaSource(masechetEn);
  if (!source) {
    throw new Error('אין ביאור חברותא למסכת זו');
  }

  const response = await fetch(buildChavrutaUrl(source));
  if (!response.ok) {
    throw new Error('לא ניתן לטעון את ביאור חברותא. בדקו את החיבור לרשת.');
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return decodeHtmlBytes(bytes);
}

async function getMasechetHtml(masechetEn: string, forceRefresh: boolean): Promise<string> {
  if (!forceRefresh) {
    const existing = rawHtml.get(masechetEn);
    if (existing) {
      return existing;
    }
    const pending = htmlInFlight.get(masechetEn);
    if (pending) {
      return pending;
    }
  }

  const promise = fetchMasechetHtml(masechetEn);
  htmlInFlight.set(masechetEn, promise);
  try {
    const html = await promise;
    if (htmlInFlight.get(masechetEn) === promise) {
      rawHtml.set(masechetEn, html);
    }
    return html;
  } finally {
    if (htmlInFlight.get(masechetEn) === promise) {
      htmlInFlight.delete(masechetEn);
    }
  }
}

function startFullParse(masechetEn: string, html: string): Promise<ChavrutaMasechetCache> {
  const pending = fullParseInFlight.get(masechetEn);
  if (pending) {
    return pending;
  }

  const previousToken = parseTokens.get(masechetEn);
  if (previousToken) {
    previousToken.cancelled = true;
  }
  const token = { cancelled: false };
  parseTokens.set(masechetEn, token);

  const promise = (async () => {
    await Promise.resolve();
    if (token.cancelled) {
      return {
        v: CHAVRUTA_CACHE_VERSION,
        masechetEn,
        amudim: [],
      };
    }
    const amudim = parseChavrutaDocument(html);
    if (amudim.length === 0) {
      throw new Error('לא ניתן לפענח את ביאור חברותא למסכת זו');
    }
    const cache: ChavrutaMasechetCache = {
      v: CHAVRUTA_CACHE_VERSION,
      masechetEn,
      amudim,
    };
    await enqueueMasechetWrite(masechetEn, async () => {
      if (token.cancelled) {
        return;
      }
      await writeCachedMasechet(cache);
      if (token.cancelled) {
        if (parseTokens.get(masechetEn) === token || !parseTokens.has(masechetEn)) {
          await deleteCachedMasechet(masechetEn);
          memoryCache.delete(masechetEn);
        }
        return;
      }
      memoryCache.set(masechetEn, cache);
      rawHtml.delete(masechetEn);
    });
    if (token.cancelled) {
      return {
        v: CHAVRUTA_CACHE_VERSION,
        masechetEn,
        amudim: [],
      };
    }
    return cache;
  })();

  fullParseInFlight.set(masechetEn, promise);
  void promise.then(
    () => {
      if (fullParseInFlight.get(masechetEn) === promise) {
        fullParseInFlight.delete(masechetEn);
      }
    },
    () => {
      if (fullParseInFlight.get(masechetEn) === promise) {
        fullParseInFlight.delete(masechetEn);
      }
    },
  );
  return promise;
}

function toPageData(masechetEn: string, page: ChavrutaAmud): ChavrutaPageData {
  return {
    ...page,
    masechetEn,
  };
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

  const forceRefresh = options.forceRefresh === true;
  if (forceRefresh) {
    invalidateChavrutaMemoryCache(normalized);
    await deleteCachedMasechet(normalized);
  } else {
    const remembered = memoryCache.get(normalized);
    if (remembered) {
      const page = findChavrutaAmud(remembered.amudim, resolved.dafNum, resolved.amud);
      if (!page) {
        throw new Error('לא נמצא ביאור חברותא לעמוד זה');
      }
      return toPageData(normalized, page);
    }

    const cached = await readCachedMasechet(normalized);
    if (cached) {
      memoryCache.set(normalized, cached);
      const page = findChavrutaAmud(cached.amudim, resolved.dafNum, resolved.amud);
      if (!page) {
        throw new Error('לא נמצא ביאור חברותא לעמוד זה');
      }
      return toPageData(normalized, page);
    }
  }

  const html = await getMasechetHtml(normalized, forceRefresh);
  const page = parseChavrutaAmudFromHtml(html, resolved.dafNum, resolved.amud);
  if (!page) {
    void startFullParse(normalized, html);
    throw new Error('לא נמצא ביאור חברותא לעמוד זה');
  }

  void startFullParse(normalized, html);
  return toPageData(normalized, page);
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
