import * as FileSystem from 'expo-file-system/legacy';
import { SHAS_MASECHTOT } from '../data/shas';
import { prepareCommentaryText, prepareGemaraText } from '../utils/commentaryEmphasis';
import {
  getChapterEventsForAmud,
  type SefariaChapterEvent,
} from '../utils/chapterBoundaries';
import {
  COMMENTATOR_TITLE_HE,
  commentatorFetchSpecs,
  identifySefariaCommentator,
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
const SEFARIA_TEXT_CACHE_VERSION = 19;

async function ensureCacheDir(): Promise<string> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
  return CACHE_DIR;
}

function getCacheFilePath(tref: string): string {
  const safeTref = tref.replace(/\./g, '_');
  return `${CACHE_DIR}${safeTref}.json`;
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

interface FetchFromNetworkOptions {
  displayTitleHe?: string;
  shekalimLocation?: { dafNum: number; amud: Amud; masechetHe: string };
  mishnahLocation?: { masechetEn: string; dafNum: number; amud: Amud };
}

async function fetchFromNetwork(
  tref: string,
  options: FetchFromNetworkOptions = {},
): Promise<SefariaPageData> {
  const mainUrl = `https://www.sefaria.org/api/texts/${encodeURI(tref)}?context=0&commentary=1`;
  const mainRes = await fetch(mainUrl);
  if (!mainRes.ok) {
    throw new Error(`Failed to fetch text for ${tref}: HTTP ${mainRes.status}`);
  }
  const mainJson = await mainRes.json();

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
  const shekalim = Boolean(options.shekalimLocation);
  const mishnah = Boolean(options.mishnahLocation);

  if (!shekalim && !mishnah) {
    const rawCommentaryList = Array.isArray(mainJson.commentary)
      ? mainJson.commentary
      : Array.isArray(mainJson.commentaries)
        ? mainJson.commentaries
        : [];

    rawCommentaryList.forEach((item: any) => {
      if (!item || !item.he) return;

      const key = identifySefariaCommentator(item);
      if (!key) return;

      const titleHe = COMMENTATOR_TITLE_HE[key];

      const anchor = item.anchorRef || item.anchorRefExpanded?.[0] || item.sourceRef || '';
      const match = anchor.match(/:(\d+)$/);
      if (!match) return;

      const segNum = parseInt(match[1], 10);
      if (isNaN(segNum) || segNum < 1) return;
      const segIdx = segNum - 1;

      const textStr = typeof item.he === 'string' ? item.he : flattenTextArray(item.he).join('\n');
      const clean = prepareCommentaryText(textStr, key);
      if (!clean) return;

      if (!commentaries[segIdx]) {
        commentaries[segIdx] = [];
      }

      const existingIndex = commentaries[segIdx].findIndex((c) => c.commentator === key);
      if (existingIndex >= 0) {
        if (!commentaries[segIdx][existingIndex].he.includes(clean)) {
          commentaries[segIdx][existingIndex].he += '\n\n' + clean;
        }
      } else {
        commentaries[segIdx].push({
          commentator: key,
          titleHe,
          ref: item.ref || `${key}:${segNum}`,
          he: clean,
        });
      }
    });
  }

  const gemaraAddresses = shekalim
    ? gemaraAddressesForPage(
        segments.length,
        mainJson.sections,
        mainJson.toSections,
        mainJson.spanningRefs,
      )
    : [];

  const commTypes = commentatorFetchSpecs(tref, shekalim);

  await Promise.all(
    commTypes.map(async (comm) => {
      try {
        const commUrl = `https://www.sefaria.org/api/texts/${encodeURI(comm.prefix)}?context=0`;
        const commRes = await fetch(commUrl);
        if (!commRes.ok) return;
        const commJson = await commRes.json();

        if (commJson.he == null) return;

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

          const combinedText = prepared.join('\n\n');
          if (!commentaries[segIdx]) {
            commentaries[segIdx] = [];
          }

          const existingIndex = commentaries[segIdx].findIndex((c) => c.commentator === comm.key);
          if (existingIndex >= 0) {
            if (!commentaries[segIdx][existingIndex].he.includes(combinedText)) {
              commentaries[segIdx][existingIndex].he += '\n\n' + combinedText;
            }
          } else {
            commentaries[segIdx].push({
              commentator: comm.key,
              titleHe: comm.titleHe,
              ref: `${comm.prefix}:${segIdx + 1}`,
              he: combinedText,
            });
          }
        });
      } catch {
      }
    })
  );

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

export async function fetchSefariaPageText(
  masechetEn: string,
  dafNum: number,
  amud: Amud
): Promise<SefariaPageData> {
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
    throw new Error(shekalim ? 'לא נמצא טקסט לשקלים לעמוד זה' : 'לא נמצא טקסט לדף זה');
  }
  const cachePath = getCacheFilePath(tref);

  try {
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (fileInfo.exists && (fileInfo.size ?? 0) > 100) {
      const content = await FileSystem.readAsStringAsync(cachePath);
      const parsed = JSON.parse(content) as SefariaPageData & { v?: number };
      if (
        parsed &&
        parsed.v === SEFARIA_TEXT_CACHE_VERSION &&
        Array.isArray(parsed.segments) &&
        parsed.segments.length > 0
      ) {
        return {
          ...parsed,
          chapterEvents: Array.isArray(parsed.chapterEvents) ? parsed.chapterEvents : [],
        };
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
    ? { displayTitleHe: `תמיד · ${formatDafLabel(dafNum, amud)}` }
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
        : {};

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

  try {
    await ensureCacheDir();
    await FileSystem.writeAsStringAsync(cachePath, JSON.stringify(data));
  } catch {
  }

  return data;
}

export async function clearSefariaTextCache(): Promise<void> {
  invalidateSefariaChaptersMemoryCache();
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
  } catch {
  }
}
