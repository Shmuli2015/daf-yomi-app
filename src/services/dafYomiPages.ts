import { buildSefariaTref, Amud } from '../utils/dafNavigation';
import { buildDafYomiPdfUrl, resolveDafYomiPageId } from '../utils/dafYomiPageId';
import { clearCachedManuscriptImage } from './sefariaManuscripts';
import {
  downloadTzuratHadafFile,
  findTzuratHadafFile,
  MIN_PDF_BYTES,
} from './tzuratHadafStorage';

export interface DafYomiPage {
  kind: 'pdf';
  uri: string;
  remoteUrl: string;
}

const pdfUriCache = new Map<string, string>();

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

async function readDiskCache(tref: string): Promise<string | null> {
  const path = await findTzuratHadafFile(tref, 'pdf', MIN_PDF_BYTES);
  if (!path) return null;
  pdfUriCache.set(tref, path);
  return path;
}

export function peekCachedPdfUri(tref: string): string | null {
  return pdfUriCache.get(tref) ?? null;
}

export async function resolveCachedPdfUri(tref: string): Promise<string | null> {
  const memory = peekCachedPdfUri(tref);
  if (memory) return memory;
  return readDiskCache(tref);
}

export async function fetchDafYomiPage(
  masechetEn: string,
  dafNum: number,
  amud: Amud
): Promise<DafYomiPage | null> {
  const pageId = resolveDafYomiPageId(masechetEn, dafNum, amud);
  if (pageId == null) return null;

  const tref = buildSefariaTref(masechetEn, dafNum, amud);
  const remoteUrl = buildDafYomiPdfUrl(pageId);

  const cachedUri = await resolveCachedPdfUri(tref);
  if (cachedUri) {
    await clearCachedManuscriptImage(tref);
    return { kind: 'pdf', uri: cachedUri, remoteUrl };
  }

  try {
    const localUri = await downloadTzuratHadafFile(tref, 'pdf', remoteUrl);
    pdfUriCache.set(tref, localUri);
    await clearCachedManuscriptImage(tref);
    return { kind: 'pdf', uri: localUri, remoteUrl };
  } catch {
    const exists = await remotePdfExists(remoteUrl);
    if (!exists) return null;
    return { kind: 'pdf', uri: remoteUrl, remoteUrl };
  }
}
