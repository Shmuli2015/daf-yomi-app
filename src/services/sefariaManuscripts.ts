import { buildSefariaTref, Amud } from '../utils/dafNavigation';
import {
  deleteTzuratHadafFile,
  downloadTzuratHadafFile,
  findTzuratHadafFile,
  MIN_IMAGE_BYTES,
} from './tzuratHadafStorage';

export interface ManuscriptPage {
  imageUrl: string;
  thumbnailUrl?: string;
  manuscriptTitle: string;
  manuscriptTitleHe?: string;
}

interface ManuscriptApiItem {
  manuscript_slug?: string;
  page_id?: string;
  anchorRef?: string;
  image_url?: string;
  thumbnail_url?: string;
  manuscript?: {
    title?: string;
    he_title?: string;
  };
}

const VILNA_SLUG_HINTS = ['vilna', 'romm', 'widow'];

const imageUriCache = new Map<string, string>();
const apiCache = new Map<string, ManuscriptPage>();

function isVilnaManuscript(item: ManuscriptApiItem): boolean {
  const slug = (item.manuscript_slug || '').toLowerCase();
  const title = (item.manuscript?.title || '').toLowerCase();
  return VILNA_SLUG_HINTS.some((hint) => slug.includes(hint) || title.includes(hint));
}

function matchesAmudRef(item: ManuscriptApiItem, tref: string): boolean {
  const pageId = (item.page_id || '').replace(/\s+/g, ' ').trim();
  const anchor = (item.anchorRef || '').replace(/\s+/g, ' ').trim();
  const normalizedTref = tref.replace(/_/g, ' ').replace(/\./g, ' ');

  if (pageId === tref || pageId === normalizedTref) return true;
  if (anchor === tref || anchor === normalizedTref) return true;

  const trefParts = tref.split('.');
  if (trefParts.length === 2) {
    const spaced = `${trefParts[0]} ${trefParts[1]}`;
    if (pageId === spaced || anchor === spaced) return true;
  }

  return anchor.startsWith(tref) && !anchor.includes('-');
}

function pickBestManuscript(items: ManuscriptApiItem[], tref: string): ManuscriptApiItem | null {
  if (!items.length) return null;

  const matching = items.filter((item) => matchesAmudRef(item, tref));
  const pool = matching.length > 0 ? matching : items;

  const vilna = pool.find(isVilnaManuscript);
  if (vilna?.image_url) return vilna;

  const withImage = pool.find((item) => item.image_url);
  return withImage ?? null;
}

async function fetchFromApi(tref: string): Promise<ManuscriptPage | null> {
  const cached = apiCache.get(tref);
  if (cached) return cached;

  const url = `https://www.sefaria.org/api/manuscripts/${encodeURIComponent(tref)}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as ManuscriptApiItem[];
  if (!Array.isArray(data)) return null;

  const chosen = pickBestManuscript(data, tref);
  if (!chosen?.image_url) return null;

  const page: ManuscriptPage = {
    imageUrl: chosen.image_url,
    thumbnailUrl: chosen.thumbnail_url,
    manuscriptTitle: chosen.manuscript?.title || 'Vilna',
    manuscriptTitleHe: chosen.manuscript?.he_title,
  };
  apiCache.set(tref, page);
  return page;
}

async function readDiskCache(tref: string): Promise<string | null> {
  const path = await findTzuratHadafFile(tref, 'jpg', MIN_IMAGE_BYTES);
  if (!path) return null;
  imageUriCache.set(tref, path);
  return path;
}

async function downloadToCache(tref: string, remoteUrl: string): Promise<string> {
  const localUri = await downloadTzuratHadafFile(tref, 'jpg', remoteUrl);
  imageUriCache.set(tref, localUri);
  return localUri;
}

export function peekCachedImageUri(tref: string): string | null {
  return imageUriCache.get(tref) ?? null;
}

export async function resolveCachedImageUri(tref: string): Promise<string | null> {
  const memory = peekCachedImageUri(tref);
  if (memory) return memory;
  return readDiskCache(tref);
}

export async function clearCachedManuscriptImage(tref: string): Promise<void> {
  imageUriCache.delete(tref);
  apiCache.delete(tref);
  await deleteTzuratHadafFile(tref, 'jpg');
}

export async function fetchVilnaManuscriptPage(
  masechetEn: string,
  dafNum: number,
  amud: Amud
): Promise<ManuscriptPage | null> {
  const tref = buildSefariaTref(masechetEn, dafNum, amud);

  const cachedUri = await resolveCachedImageUri(tref);
  if (cachedUri) {
    const meta = apiCache.get(tref);
    return {
      imageUrl: cachedUri,
      thumbnailUrl: meta?.thumbnailUrl,
      manuscriptTitle: meta?.manuscriptTitle ?? 'Vilna',
      manuscriptTitleHe: meta?.manuscriptTitleHe,
    };
  }

  const apiPage = await fetchFromApi(tref);
  if (!apiPage) return null;

  try {
    const localUri = await downloadToCache(tref, apiPage.imageUrl);
    return { ...apiPage, imageUrl: localUri };
  } catch {
    imageUriCache.set(tref, apiPage.imageUrl);
    return apiPage;
  }
}
