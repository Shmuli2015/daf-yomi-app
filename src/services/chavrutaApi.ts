import * as FileSystem from 'expo-file-system/legacy';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import {
  buildChavrutaUrl,
  getChavrutaSource,
} from '../data/chavrutaSources';
import { normalizeMasechetEn, type Amud } from '../utils/dafNavigation';
import { resolveChavrutaLocation } from '../utils/mishnahOnlySefaria';
import {
  parseChavrutaAmudFromHtml,
  parseChavrutaDocument,
  releaseChavrutaHeadingCache,
  type ChavrutaAmud,
} from '../utils/parseChavrutaHtml';
import { decodeHtmlBytes } from '../utils/windows1255';

export type {
  ChavrutaAmud,
  ChavrutaBlock,
  ChavrutaFootnote,
  ChavrutaParagraph,
} from '../utils/parseChavrutaHtml';

export const CHAVRUTA_CACHE_VERSION = 11;

export interface ChavrutaPageData extends ChavrutaAmud {
  masechetEn: string;
}

interface ChavrutaManifest {
  v: number;
  masechetEn: string;
  keys: string[];
}

interface ChavrutaMasechetMemory {
  amudim: Map<string, ChavrutaAmud>;
  complete: boolean;
}

interface FetchChavrutaAmudOptions {
  forceRefresh?: boolean;
}

const CACHE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}chavruta/`;
const memoryCache = new Map<string, ChavrutaMasechetMemory>();
const rawHtml = new Map<string, string>();
const htmlInFlight = new Map<string, Promise<string>>();
const fullParseInFlight = new Map<string, Promise<void>>();
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

function amudMapKey(dafNum: number, amud: Amud): string {
  return `${dafNum}:${amud}`;
}

function amudStorageKey(dafNum: number, amud: Amud): string {
  return `${dafNum}${amud}`;
}

function masechetDir(masechetEn: string): string {
  const safeName = masechetEn.replace(/\s+/g, '_');
  return `${CACHE_DIR}${safeName}/`;
}

function manifestPath(masechetEn: string): string {
  return `${masechetDir(masechetEn)}manifest.json`;
}

function amudFilePath(masechetEn: string, dafNum: number, amud: Amud): string {
  return `${masechetDir(masechetEn)}${amudStorageKey(dafNum, amud)}.json`;
}

function rememberAmud(masechetEn: string, page: ChavrutaAmud, complete = false): void {
  const existing = memoryCache.get(masechetEn) ?? { amudim: new Map(), complete: false };
  existing.amudim.set(amudMapKey(page.dafNum, page.amud), page);
  if (complete) {
    existing.complete = true;
  }
  memoryCache.set(masechetEn, existing);
}

export function invalidateChavrutaMemoryCache(masechetEn?: string): void {
  if (masechetEn) {
    const normalized = normalizeMasechetEn(masechetEn);
    cancelParseToken(normalized);
    memoryCache.delete(normalized);
    rawHtml.delete(normalized);
    releaseChavrutaHeadingCache();
    htmlInFlight.delete(normalized);
    fullParseInFlight.delete(normalized);
    return;
  }

  cancelParseToken();
  memoryCache.clear();
  rawHtml.clear();
  releaseChavrutaHeadingCache();
  htmlInFlight.clear();
  fullParseInFlight.clear();
}

export async function hasCachedChavrutaMasechet(masechetEn: string): Promise<boolean> {
  const normalized = normalizeMasechetEn(masechetEn);
  if (!getChavrutaSource(normalized)) {
    return false;
  }
  if (memoryCache.get(normalized)?.complete) {
    return true;
  }
  const manifest = await readManifest(normalized);
  return manifest != null;
}

async function readManifest(masechetEn: string): Promise<ChavrutaManifest | null> {
  try {
    const cachePath = manifestPath(masechetEn);
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (!fileInfo.exists || (fileInfo.size ?? 0) < 20) {
      return null;
    }
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(cachePath)) as ChavrutaManifest;
    if (
      parsed?.v === CHAVRUTA_CACHE_VERSION &&
      parsed.masechetEn === masechetEn &&
      Array.isArray(parsed.keys) &&
      parsed.keys.length > 0
    ) {
      return parsed;
    }
  } catch {
  }
  return null;
}

async function readCachedAmud(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
): Promise<ChavrutaAmud | null> {
  try {
    const cachePath = amudFilePath(masechetEn, dafNum, amud);
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (!fileInfo.exists || (fileInfo.size ?? 0) < 20) {
      return null;
    }
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(cachePath)) as ChavrutaAmud;
    if (parsed?.dafNum === dafNum && parsed.amud === amud) {
      return parsed;
    }
  } catch {
  }
  return null;
}

async function writeCachedMasechet(masechetEn: string, amudim: ChavrutaAmud[]): Promise<void> {
  try {
    await ensureCacheDir();
    const directory = masechetDir(masechetEn);
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const keys: string[] = [];
    for (const page of amudim) {
      const key = amudStorageKey(page.dafNum, page.amud);
      keys.push(key);
      await FileSystem.writeAsStringAsync(
        amudFilePath(masechetEn, page.dafNum, page.amud),
        JSON.stringify(page),
      );
    }
    const manifest: ChavrutaManifest = {
      v: CHAVRUTA_CACHE_VERSION,
      masechetEn,
      keys,
    };
    await FileSystem.writeAsStringAsync(manifestPath(masechetEn), JSON.stringify(manifest));
  } catch {
  }
}

async function deleteCachedMasechet(masechetEn: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(masechetDir(masechetEn), { idempotent: true });
  } catch {
  }
}

async function fetchMasechetHtml(masechetEn: string): Promise<string> {
  const source = getChavrutaSource(masechetEn);
  if (!source) {
    throw new Error('אין ביאור חברותא למסכת זו');
  }

  const response = await fetchWithTimeout(buildChavrutaUrl(source), {}, 35000);
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

function startFullParse(masechetEn: string, html: string): Promise<void> {
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
      return;
    }
    const amudim = parseChavrutaDocument(html);
    if (amudim.length === 0) {
      throw new Error('לא ניתן לפענח את ביאור חברותא למסכת זו');
    }
    await enqueueMasechetWrite(masechetEn, async () => {
      if (token.cancelled) {
        return;
      }
      await writeCachedMasechet(masechetEn, amudim);
      if (token.cancelled) {
        if (parseTokens.get(masechetEn) === token || !parseTokens.has(masechetEn)) {
          await deleteCachedMasechet(masechetEn);
          memoryCache.delete(masechetEn);
        }
        return;
      }
      memoryCache.set(masechetEn, {
        complete: true,
        amudim: new Map(amudim.map((page) => [amudMapKey(page.dafNum, page.amud), page])),
      });
      rawHtml.delete(masechetEn);
      releaseChavrutaHeadingCache(html);
    });
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
    const remembered = memoryCache.get(normalized)?.amudim.get(
      amudMapKey(resolved.dafNum, resolved.amud),
    );
    if (remembered) {
      return toPageData(normalized, remembered);
    }

    const cached = await readCachedAmud(normalized, resolved.dafNum, resolved.amud);
    if (cached) {
      rememberAmud(normalized, cached);
      return toPageData(normalized, cached);
    }

    if (memoryCache.get(normalized)?.complete) {
      throw new Error('לא נמצא ביאור חברותא לעמוד זה');
    }
  }

  const html = await getMasechetHtml(normalized, forceRefresh);
  const page = parseChavrutaAmudFromHtml(html, resolved.dafNum, resolved.amud);
  if (!page) {
    void startFullParse(normalized, html);
    throw new Error('לא נמצא ביאור חברותא לעמוד זה');
  }

  rememberAmud(normalized, page);
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
