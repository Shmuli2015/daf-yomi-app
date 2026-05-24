import { DAF_YOMI_MASECHET_START_IDS } from '../data/dafYomiPageStarts';
import { SHAS_MASECHTOT } from '../data/shas';
import { Amud, normalizeMasechetEn } from './dafNavigation';

const PDF_BASE_URL = 'https://daf-yomi.com/Data/UploadedFiles/DY_Page';

function findMasechetIndex(masechetEn: string): number {
  const normalized = normalizeMasechetEn(masechetEn);
  return SHAS_MASECHTOT.findIndex((m) => m.en === normalized);
}

export function buildDafYomiPdfUrl(pageId: number): string {
  return `${PDF_BASE_URL}/${pageId}.pdf`;
}

export function resolveDafYomiPageId(
  masechetEn: string,
  dafNum: number,
  amud: Amud
): number | null {
  const idx = findMasechetIndex(masechetEn);
  if (idx === -1) return null;

  const startId = DAF_YOMI_MASECHET_START_IDS[idx];
  if (startId == null) return null;

  const lastDaf = 2 + SHAS_MASECHTOT[idx].pages - 1;
  if (dafNum < 2 || dafNum > lastDaf) return null;

  return startId + (dafNum - 2) * 2 + (amud === 'b' ? 1 : 0);
}
