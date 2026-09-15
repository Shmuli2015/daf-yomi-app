import * as FileSystem from 'expo-file-system/legacy';
import {
  parseSefariaChaptersIndex,
  type SefariaChapter,
} from '../utils/chapterBoundaries';
import { getSefariaBookTitle, normalizeMasechetEn } from '../utils/dafNavigation';
import { isShekalimMasechet } from '../utils/shekalimSefaria';
import { isKinnimMasechet, isMidotMasechet } from '../utils/mishnahOnlySefaria';

const CACHE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}sefaria-text/`;
const SEFARIA_CHAPTERS_CACHE_VERSION = 1;

interface SefariaChaptersCache {
  v: number;
  masechetEn: string;
  chapters: SefariaChapter[];
}

const memoryCache = new Map<string, SefariaChapter[]>();
const inFlight = new Map<string, Promise<SefariaChapter[]>>();

export function invalidateSefariaChaptersMemoryCache(masechetEn?: string): void {
  if (masechetEn) {
    const normalized = normalizeMasechetEn(masechetEn);
    memoryCache.delete(normalized);
    inFlight.delete(normalized);
    return;
  }

  memoryCache.clear();
  inFlight.clear();
}

async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

function getCacheFilePath(masechetEn: string): string {
  const safeName = getSefariaBookTitle(masechetEn);
  return `${CACHE_DIR}chapters_${safeName}.json`;
}

async function readCachedChapters(masechetEn: string): Promise<SefariaChapter[] | null> {
  try {
    const cachePath = getCacheFilePath(masechetEn);
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (!fileInfo.exists || (fileInfo.size ?? 0) < 20) {
      return null;
    }
    const content = await FileSystem.readAsStringAsync(cachePath);
    const parsed = JSON.parse(content) as SefariaChaptersCache;
    if (
      parsed?.v === SEFARIA_CHAPTERS_CACHE_VERSION &&
      parsed.masechetEn === masechetEn &&
      Array.isArray(parsed.chapters) &&
      parsed.chapters.length > 0
    ) {
      return parsed.chapters;
    }
  } catch {
  }
  return null;
}

async function writeCachedChapters(masechetEn: string, chapters: SefariaChapter[]): Promise<void> {
  try {
    await ensureCacheDir();
    const payload: SefariaChaptersCache = {
      v: SEFARIA_CHAPTERS_CACHE_VERSION,
      masechetEn,
      chapters,
    };
    await FileSystem.writeAsStringAsync(getCacheFilePath(masechetEn), JSON.stringify(payload));
  } catch {
  }
}

async function fetchChaptersFromNetwork(masechetEn: string): Promise<SefariaChapter[]> {
  const bookTitle = getSefariaBookTitle(masechetEn);
  const response = await fetch(`https://www.sefaria.org/api/v2/index/${bookTitle}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chapters for ${bookTitle}: HTTP ${response.status}`);
  }
  const json = await response.json();
  return parseSefariaChaptersIndex(json);
}

export async function fetchSefariaChapters(masechetEn: string): Promise<SefariaChapter[]> {
  const normalized = normalizeMasechetEn(masechetEn);
  if (isShekalimMasechet(normalized) || isKinnimMasechet(normalized) || isMidotMasechet(normalized)) {
    return [];
  }

  const remembered = memoryCache.get(normalized);
  if (remembered) {
    return remembered;
  }

  const pending = inFlight.get(normalized);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    const cached = await readCachedChapters(normalized);
    if (cached) {
      memoryCache.set(normalized, cached);
      return cached;
    }

    const fetched = await fetchChaptersFromNetwork(normalized);
    if (fetched.length > 0) {
      memoryCache.set(normalized, fetched);
      await writeCachedChapters(normalized, fetched);
    }
    return fetched;
  })();

  inFlight.set(normalized, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(normalized);
  }
}
