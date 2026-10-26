import * as FileSystem from 'expo-file-system/legacy';
import { SHAS_MASECHTOT } from '../data/shas';
import { prepareCommentaryText, prepareGemaraText } from '../utils/commentaryEmphasis';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import {
  getChapterEventsForAmud,
  type SefariaChapterEvent,
} from '../utils/chapterBoundaries';
import {
  commentatorFetchSpecs,
  type SefariaCommentatorKey,
} from '../utils/sefariaCommentators';
import {
  buildSefariaTref,
  formatDafLabel,
  normalizeMasechetEn,
  Amud,
} from '../utils/dafNavigation';
import {
  alignCommentaryToSegments,
  buildShekalimChapterEvents,
  buildShekalimSefariaTref,
  collectCommentarySegmentGroups,
  gemaraAddressesForPage,
  isShekalimMasechet,
  spanningSplitIndex,
} from '../utils/shekalimSefaria';
import {
  buildMishnahOnlyChapterEvents,
  buildMishnahOnlySefariaTref,
  isKinnimTamidSharedAmud,
  isMishnahOnlySlot,
  mishnahAddressesForPage,
  mishnahLabelHe,
  spanningMishnahSplitIndex,
} from '../utils/mishnahOnlySefaria';
import {
  fetchSefariaChapters,
  invalidateSefariaChaptersMemoryCache,
} from './sefariaChapters';

export interface SefariaSegment {
  index: number;
  ref: string;
  he: string;
  mishnahLabel?: string;
}

export interface SefariaCommentaryItem {
  commentator: SefariaCommentatorKey;
  titleHe: string;
  ref: string;
  he: string;
}

export interface SefariaPageData {
  tref: string;
  titleHe: string;
  titleEn: string;
  segments: SefariaSegment[];
  commentaries: Record<number, SefariaCommentaryItem[]>;
  chapterEvents: SefariaChapterEvent[];
}

const CACHE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}sefaria-text/`;
export const SEFARIA_TEXT_CACHE_VERSION = 20;
const MEMORY_CACHE_MAX = 24;
const memoryCache = new Map<string, SefariaPageData>();
const inFlight = new Map<string, Promise<SefariaLoadResult>>();

interface SefariaLoadResult {
  data: SefariaPageData;
  savedToDisk: boolean;
}

function memoryCacheKey(tref: string, plainGemara: boolean): string {
  return `${tref}${plainGemara ? '.plain' : ''}`;
}

function readMemoryCache(key: string): SefariaPageData | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  memoryCache.delete(key);
  memoryCache.set(key, cached);
  return cached;
}

function writeMemoryCache(key: string, data: SefariaPageData): void {
  if (memoryCache.has(key)) {
    memoryCache.delete(key);
  }
  memoryCache.set(key, data);
  while (memoryCache.size > MEMORY_CACHE_MAX) {
    const oldest = memoryCache.keys().next().value;
    if (oldest === undefined) break;
    memoryCache.delete(oldest);
  }
}

export function invalidateSefariaTextMemoryCache(): void {
  memoryCache.clear();
  inFlight.clear();
}

async function ensureCacheDir(): Promise<string> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
  return CACHE_DIR;
}

function getCacheFilePath(tref: string, plainGemara: boolean): string {
  const safeTref = tref.replace(/\./g, '_');
  const variant = plainGemara ? '.plain' : '';
  return `${CACHE_DIR}${safeTref}${variant}.json`;
}

export function cleanHebrewHtml(html: string): string {
  return prepareGemaraText(html);
}

function flattenTextArray(data: any): string[] {
  if (!data) return [];
  if (typeof data === 'string') return [data];
  if (Array.isArray(data)) {
    const result: string[] = [];
    for (const item of data) {
      if (typeof item === 'string') {
        result.push(item);
      } else if (Array.isArray(item)) {
        result.push(...flattenTextArray(item));
      }
    }
    return result;
  }
  return [];
}

const UNVOCALIZED_GEMARA_VERSION = 'William Davidson Edition - Aramaic';

interface FetchFromNetworkOptions {
  displayTitleHe?: string;
  shekalimLocation?: { dafNum: number; amud: Amud; masechetHe: string };
  mishnahLocation?: { masechetEn: string; dafNum: number; amud: Amud };
  plainGemara?: boolean;
}

function appendCommentary(
  commentaries: Record<number, SefariaCommentaryItem[]>,
  segIdx: number,
  item: SefariaCommentaryItem,
): void {
  if (!commentaries[segIdx]) {
    commentaries[segIdx] = [];
  }

  const existingIndex = commentaries[segIdx].findIndex(
    (entry) => entry.commentator === item.commentator,
  );
  if (existingIndex >= 0) {
    if (!commentaries[segIdx][existingIndex].he.includes(item.he)) {
      commentaries[segIdx][existingIndex].he += '\n\n' + item.he;
    }
    return;
  }

  commentaries[segIdx].push(item);
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchFromNetwork(
  tref: string,
  options: FetchFromNetworkOptions = {},
): Promise<SefariaPageData> {
  const versionQuery = options.plainGemara
    ? `&vhe=${encodeURIComponent(UNVOCALIZED_GEMARA_VERSION)}`
    : '';
  const mainUrl = `https://www.sefaria.org/api/texts/${encodeURI(tref)}?context=0&commentary=0${versionQuery}`;
  const shekalim = Boolean(options.shekalimLocation);
  const commTypes = commentatorFetchSpecs(tref, shekalim);

  const mainPromise = fetchJson(mainUrl);
  const commPromises = commTypes.map(async (comm) => {
    try {
      const commUrl = `https://www.sefaria.org/api/texts/${encodeURI(comm.prefix)}?context=0`;
      const json = await fetchJson(commUrl);
      return { comm, json };
    } catch {
      return { comm, json: null };
    }
  });

  const [mainJson, ...commResults] = await Promise.all([mainPromise, ...commPromises]);

  const titleHe = options.displayTitleHe || mainJson.heTitle || mainJson.ref || tref;
  const titleEn = mainJson.ref || tref;
  const rawSegments = flattenTextArray(mainJson.he);
  const mishnahAddresses = options.mishnahLocation
    ? mishnahAddressesForPage(
        options.mishnahLocation.masechetEn,
        options.mishnahLocation.dafNum,
        options.mishnahLocation.amud,
      )
    : [];

  const segments: SefariaSegment[] = rawSegments.map((text, idx) => ({
    index: idx,
    ref: `${tref}:${idx + 1}`,
    he: cleanHebrewHtml(text),
    ...(mishnahAddresses[idx]
      ? { mishnahLabel: mishnahLabelHe(mishnahAddresses[idx].mishnah) }
      : {}),
  }));

  const commentaries: Record<number, SefariaCommentaryItem[]> = {};
  const gemaraAddresses = shekalim
    ? gemaraAddressesForPage(
        segments.length,
        mainJson.sections,
        mainJson.toSections,
        mainJson.spanningRefs,
      )
    : [];

  for (const { comm, json: commJson } of commResults) {
    if (!commJson || commJson.he == null) {
      continue;
    }

    const commentarySegments: Array<{ segIdx: number; texts: string[] }> =
      comm.mode === 'flatten'
        ? flattenTextArray(commJson.he).map((segText, segIdx) => ({
            segIdx,
            texts: [segText],
          }))
        : comm.mode === 'yerushalmi'
          ? alignCommentaryToSegments(
              commJson.he,
              segments.length,
              gemaraAddresses,
              commJson.spanningRefs,
            )
          : comm.mode === 'mishnah'
            ? collectCommentarySegmentGroups(commJson.he)
                .map((texts, segIdx) => ({ segIdx, texts }))
                .filter((entry) => entry.segIdx < segments.length)
            : (Array.isArray(commJson.he) ? commJson.he : []).map(
                (segComm: unknown, segIdx: number) => ({
                  segIdx,
                  texts: flattenTextArray(segComm),
                }),
              );

    commentarySegments.forEach(({ segIdx, texts }) => {
      const prepared = texts
        .map((segText) => prepareCommentaryText(segText, comm.key))
        .filter(Boolean);
      if (prepared.length === 0) return;

      appendCommentary(commentaries, segIdx, {
        commentator: comm.key,
        titleHe: comm.titleHe,
        ref: `${comm.prefix}:${segIdx + 1}`,
        he: prepared.join('\n\n'),
      });
    });
  }

  const shekalimLocation = options.shekalimLocation;
  const mishnahLocation = options.mishnahLocation;
  const chapterEvents = mishnahLocation
    ? buildMishnahOnlyChapterEvents(
        mishnahLocation.masechetEn,
        mishnahLocation.dafNum,
        mishnahLocation.amud,
        segments.length,
        spanningMishnahSplitIndex(mainJson.he),
      )
    : shekalimLocation
      ? buildShekalimChapterEvents(
          shekalimLocation.dafNum,
          shekalimLocation.amud,
          segments.length,
          spanningSplitIndex(mainJson.he),
          shekalimLocation.masechetHe,
        )
      : [];

  return {
    tref,
    titleHe,
    titleEn,
    segments,
    commentaries,
    chapterEvents,
    v: SEFARIA_TEXT_CACHE_VERSION,
  } as SefariaPageData;
}

function resolveSefariaCacheIdentity(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  gemaraNikud: boolean,
): { tref: string; plainGemara: boolean; shekalim: boolean; mishnah: boolean; sharedAmud: boolean } | null {
  const shekalim = isShekalimMasechet(masechetEn);
  const sharedAmud = isKinnimTamidSharedAmud(masechetEn, dafNum, amud);
  const mishnah = isMishnahOnlySlot(masechetEn, dafNum, amud);
  const tref = sharedAmud
    ? 'Tamid.25b'
    : mishnah
      ? buildMishnahOnlySefariaTref(masechetEn, dafNum, amud)
      : shekalim
        ? buildShekalimSefariaTref(dafNum, amud)
        : buildSefariaTref(masechetEn, dafNum, amud);
  if (!tref) {
    return null;
  }
  const plainGemara = !gemaraNikud && !shekalim && !mishnah;
  return { tref, plainGemara, shekalim, mishnah, sharedAmud };
}

export async function hasCachedSefariaPageText(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  gemaraNikud = true,
): Promise<boolean> {
  const identity = resolveSefariaCacheIdentity(masechetEn, dafNum, amud, gemaraNikud);
  if (!identity) {
    return false;
  }
  const memKey = memoryCacheKey(identity.tref, identity.plainGemara);
  if (readMemoryCache(memKey)) {
    return true;
  }
  try {
    const cachePath = getCacheFilePath(identity.tref, identity.plainGemara);
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (!fileInfo.exists || (fileInfo.size ?? 0) <= 100) {
      return false;
    }
    const content = await FileSystem.readAsStringAsync(cachePath);
    const parsed = JSON.parse(content) as SefariaPageData & { v?: number };
    return (
      !!parsed &&
      parsed.v === SEFARIA_TEXT_CACHE_VERSION &&
      Array.isArray(parsed.segments) &&
      parsed.segments.length > 0
    );
  } catch {
    return false;
  }
}

export const SEFARIA_DISK_WRITE_ERROR_MESSAGE = 'הדף לא נשמר במכשיר';

export class SefariaDiskWriteError extends Error {
  constructor() {
    super(SEFARIA_DISK_WRITE_ERROR_MESSAGE);
    this.name = 'SefariaDiskWriteError';
  }
}

export interface FetchSefariaPageTextOptions {
  requireDiskCache?: boolean;
}

function readDiskPage(
  parsed: SefariaPageData & { v?: number },
): SefariaPageData | null {
  if (
    !parsed ||
    parsed.v !== SEFARIA_TEXT_CACHE_VERSION ||
    !Array.isArray(parsed.segments) ||
    parsed.segments.length === 0
  ) {
    return null;
  }
  return {
    ...parsed,
    chapterEvents: Array.isArray(parsed.chapterEvents) ? parsed.chapterEvents : [],
  };
}

async function loadSefariaPage(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  identity: NonNullable<ReturnType<typeof resolveSefariaCacheIdentity>>,
): Promise<SefariaLoadResult> {
  const { tref, plainGemara, shekalim, mishnah, sharedAmud } = identity;
  const memKey = memoryCacheKey(tref, plainGemara);
  const cachePath = getCacheFilePath(tref, plainGemara);

  try {
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (fileInfo.exists && (fileInfo.size ?? 0) > 100) {
      const content = await FileSystem.readAsStringAsync(cachePath);
      const page = readDiskPage(JSON.parse(content) as SefariaPageData & { v?: number });
      if (page) {
        writeMemoryCache(memKey, page);
        return { data: page, savedToDisk: true };
      }
    }
  } catch {
  }

  const normalized = normalizeMasechetEn(masechetEn);
  const masechetHe = SHAS_MASECHTOT.find(
    (masechet) => masechet.en === normalized
  )?.he;

  const chapterSource = sharedAmud ? 'Tamid' : masechetEn;
  const skipIndexChapters = shekalim || mishnah;

  const networkOptions = sharedAmud
    ? { displayTitleHe: `תמיד · ${formatDafLabel(dafNum, amud)}`, plainGemara }
    : mishnah
      ? {
          displayTitleHe: `${masechetHe ?? ''} · ${formatDafLabel(dafNum, amud)}`.replace(/^ · /, ''),
          mishnahLocation: { masechetEn: normalized, dafNum, amud },
        }
      : shekalim
        ? {
            displayTitleHe: `שקלים · ${formatDafLabel(dafNum, amud)}`,
            shekalimLocation: { dafNum, amud, masechetHe: masechetHe ?? 'שקלים' },
          }
        : { plainGemara };

  const [data, chapters] = await Promise.all([
    fetchFromNetwork(tref, networkOptions),
    skipIndexChapters ? Promise.resolve([]) : fetchSefariaChapters(chapterSource).catch(() => []),
  ]);

  if (!shekalim && !mishnah) {
    data.chapterEvents = getChapterEventsForAmud(
      chapters,
      dafNum,
      amud,
      data.segments.length,
      sharedAmud ? 'תמיד' : masechetHe,
    );
  }

  let savedToDisk = true;
  try {
    await ensureCacheDir();
    await FileSystem.writeAsStringAsync(cachePath, JSON.stringify(data));
  } catch {
    savedToDisk = false;
  }

  writeMemoryCache(memKey, data);
  return { data, savedToDisk };
}

export async function fetchSefariaPageText(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  gemaraNikud = true,
  options: FetchSefariaPageTextOptions = {},
): Promise<SefariaPageData> {
  const identity = resolveSefariaCacheIdentity(masechetEn, dafNum, amud, gemaraNikud);
  if (!identity) {
    const shekalim = isShekalimMasechet(masechetEn);
    throw new Error(shekalim ? 'לא נמצא טקסט לשקלים לעמוד זה' : 'לא נמצא טקסט לדף זה');
  }
  const memKey = memoryCacheKey(identity.tref, identity.plainGemara);
  const remembered = readMemoryCache(memKey);
  if (remembered && !options.requireDiskCache) {
    return remembered;
  }

  const pending = inFlight.get(memKey);
  const promise = pending ?? loadSefariaPage(masechetEn, dafNum, amud, identity);
  if (!pending) {
    inFlight.set(memKey, promise);
  }

  try {
    const result = await promise;
    if (!result.savedToDisk && options.requireDiskCache) {
      throw new SefariaDiskWriteError();
    }
    return result.data;
  } finally {
    if (inFlight.get(memKey) === promise) {
      inFlight.delete(memKey);
    }
  }
}

export async function clearSefariaTextCache(): Promise<void> {
  invalidateSefariaChaptersMemoryCache();
  invalidateSefariaTextMemoryCache();
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
  } catch {
  }
}
