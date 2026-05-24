import * as FileSystem from 'expo-file-system/legacy';
import { buildSefariaTref, Amud } from '../utils/dafNavigation';
import { buildDafYomiPdfUrl, resolveDafYomiPageId } from '../utils/dafYomiPageId';
import { clearCachedManuscriptImage } from './sefariaManuscripts';

export interface DafYomiPage {
  kind: 'pdf';
  uri: string;
  remoteUrl: string;
}

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}tzurat-hadaf/`;

const pdfUriCache = new Map<string, string>();

function cacheFilePath(tref: string): string {
  return `${CACHE_DIR}${tref.replace(/\./g, '_')}.pdf`;
}

async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

async function readDiskCache(tref: string): Promise<string | null> {
  const path = cacheFilePath(tref);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  pdfUriCache.set(tref, path);
  return path;
}

async function downloadToCache(tref: string, remoteUrl: string): Promise<string> {
  await ensureCacheDir();
  const path = cacheFilePath(tref);
  const existing = await FileSystem.getInfoAsync(path);
  if (existing.exists) {
    pdfUriCache.set(tref, path);
    return path;
  }

  const result = await FileSystem.downloadAsync(remoteUrl, path);
  pdfUriCache.set(tref, result.uri);
  return result.uri;
}

async function remotePdfExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) return true;
    if (response.status === 405) {
      const getResponse = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
      return getResponse.ok;
    }
    return false;
  } catch {
    return false;
  }
}

export function peekCachedPdfUri(tref: string): string | null {
  return pdfUriCache.get(tref) ?? null;
}

export async function resolveCachedPdfUri(tref: string): Promise<string | null> {
  const memory = peekCachedPdfUri(tref);
  if (memory) return memory;
  return readDiskCache(tref);
}

const LOG_PREFIX = '[tzuratHadaf]';

function logDafYomi(message: string, details?: Record<string, unknown>): void {
  if (details) {
    console.log(`${LOG_PREFIX} ${message}`, details);
    return;
  }
  console.log(`${LOG_PREFIX} ${message}`);
}

export async function fetchDafYomiPage(
  masechetEn: string,
  dafNum: number,
  amud: Amud
): Promise<DafYomiPage | null> {
  const pageId = resolveDafYomiPageId(masechetEn, dafNum, amud);
  if (pageId == null) {
    logDafYomi('no daf-yomi.com page id', { masechetEn, dafNum, amud });
    return null;
  }

  const tref = buildSefariaTref(masechetEn, dafNum, amud);
  const remoteUrl = buildDafYomiPdfUrl(pageId);

  const cachedUri = await resolveCachedPdfUri(tref);
  if (cachedUri) {
    await clearCachedManuscriptImage(tref);
    logDafYomi('using cached daf-yomi.com pdf', { tref, pageId, remoteUrl, uri: cachedUri });
    return { kind: 'pdf', uri: cachedUri, remoteUrl };
  }

  logDafYomi('fetching daf-yomi.com pdf', { tref, pageId, remoteUrl });
  const exists = await remotePdfExists(remoteUrl);
  if (!exists) {
    logDafYomi('daf-yomi.com pdf unavailable', { tref, pageId, remoteUrl });
    return null;
  }

  try {
    const localUri = await downloadToCache(tref, remoteUrl);
    await clearCachedManuscriptImage(tref);
    logDafYomi('downloaded daf-yomi.com pdf', { tref, pageId, remoteUrl, uri: localUri });
    return { kind: 'pdf', uri: localUri, remoteUrl };
  } catch (error) {
    logDafYomi('download failed, using remote daf-yomi.com pdf', {
      tref,
      pageId,
      remoteUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return { kind: 'pdf', uri: remoteUrl, remoteUrl };
  }
}
