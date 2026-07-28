import * as FileSystem from 'expo-file-system/legacy';
import { buildSefariaTref, Amud } from '../utils/dafNavigation';

export interface SefariaSegment {
  index: number;
  ref: string;
  he: string;
}

export interface SefariaCommentaryItem {
  commentator: 'rashi' | 'steinsaltz';
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
}

const CACHE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}sefaria-text/`;

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
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
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

async function fetchFromNetwork(tref: string): Promise<SefariaPageData> {
  const mainUrl = `https://www.sefaria.org/api/texts/${tref}?context=0&commentary=1`;
  const mainRes = await fetch(mainUrl);
  if (!mainRes.ok) {
    throw new Error(`Failed to fetch text for ${tref}: HTTP ${mainRes.status}`);
  }
  const mainJson = await mainRes.json();

  const titleHe = mainJson.heTitle || mainJson.ref || tref;
  const titleEn = mainJson.ref || tref;
  const rawSegments = flattenTextArray(mainJson.he);

  const segments: SefariaSegment[] = rawSegments.map((text, idx) => ({
    index: idx,
    ref: `${tref}:${idx + 1}`,
    he: cleanHebrewHtml(text),
  }));

  const commentaries: Record<number, SefariaCommentaryItem[]> = {};

  const rawCommentaryList = Array.isArray(mainJson.commentary)
    ? mainJson.commentary
    : Array.isArray(mainJson.commentaries)
      ? mainJson.commentaries
      : [];

  rawCommentaryList.forEach((item: any) => {
    if (!item || !item.he) return;

    let key: 'rashi' | 'steinsaltz' | null = null;
    let titleHe = '';

    const enTitle = (
      item.collectiveTitle?.en ||
      item.commentator ||
      item.indexTitle ||
      item.ref ||
      ''
    ).toLowerCase();
    const heTitle = item.collectiveTitle?.he || item.heTitle || '';

    if (enTitle.includes('rashi') || heTitle.includes('רש״י') || heTitle.includes('רש"י')) {
      key = 'rashi';
      titleHe = 'רש״י';
    } else if (enTitle.includes('steinsaltz') || heTitle.includes('שטיינזלץ')) {
      key = 'steinsaltz';
      titleHe = 'שטיינזלץ';
    }

    if (!key) return;

    const anchor = item.anchorRef || item.anchorRefExpanded?.[0] || item.sourceRef || '';
    const match = anchor.match(/:(\d+)$/);
    if (!match) return;

    const segNum = parseInt(match[1], 10);
    if (isNaN(segNum) || segNum < 1) return;
    const segIdx = segNum - 1;

    const textStr = typeof item.he === 'string' ? item.he : flattenTextArray(item.he).join('\n');
    const clean = cleanHebrewHtml(textStr);
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

  const commTypes: Array<{ key: 'rashi' | 'steinsaltz'; prefix: string; titleHe: string }> = [
    { key: 'rashi', prefix: `Rashi_on_${tref}`, titleHe: 'רש״י' },
    { key: 'steinsaltz', prefix: `Steinsaltz_on_${tref}`, titleHe: 'שטיינזלץ' },
  ];

  await Promise.all(
    commTypes.map(async (comm) => {
      try {
        const commUrl = `https://www.sefaria.org/api/texts/${comm.prefix}?context=0`;
        const commRes = await fetch(commUrl);
        if (!commRes.ok) return;
        const commJson = await commRes.json();

        if (Array.isArray(commJson.he)) {
          commJson.he.forEach((segComm: any, segIdx: number) => {
            const texts = flattenTextArray(segComm).map(cleanHebrewHtml).filter(Boolean);
            if (texts.length === 0) return;

            const combinedText = texts.join('\n\n');
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
        }
      } catch {
      }
    })
  );

  return {
    tref,
    titleHe,
    titleEn,
    segments,
    commentaries,
    v: 5,
  } as SefariaPageData;
}

export async function fetchSefariaPageText(
  masechetEn: string,
  dafNum: number,
  amud: Amud
): Promise<SefariaPageData> {
  const tref = buildSefariaTref(masechetEn, dafNum, amud);
  const cachePath = getCacheFilePath(tref);

  try {
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (fileInfo.exists && (fileInfo.size ?? 0) > 100) {
      const content = await FileSystem.readAsStringAsync(cachePath);
      const parsed = JSON.parse(content) as SefariaPageData & { v?: number };
      if (parsed && parsed.v === 5 && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
        return parsed;
      }
    }
  } catch {
  }

  const data = await fetchFromNetwork(tref);

  try {
    await ensureCacheDir();
    await FileSystem.writeAsStringAsync(cachePath, JSON.stringify(data));
  } catch {
  }

  return data;
}

export async function clearSefariaTextCache(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
  } catch {
  }
}
