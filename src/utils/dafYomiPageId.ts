import { DAF_YOMI_MASECHET_START_IDS } from '../data/dafYomiPageStarts';
import { SHAS_MASECHTOT } from '../data/shas';
import { Amud, normalizeMasechetEn } from './dafNavigation';
import { getMasechetDafim, doesMasechetEndOnAmudA } from './shas';

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
  const normalized = normalizeMasechetEn(masechetEn);
  const idx = findMasechetIndex(normalized);
  if (idx === -1) return null;

  const startId = DAF_YOMI_MASECHET_START_IDS[idx];
  if (startId == null) return null;

  const dafim = getMasechetDafim(normalized);
  const startDaf = dafim.length > 0 ? dafim[0] : 2;
  const lastDaf = dafim.length > 0 ? dafim[dafim.length - 1] : startDaf + SHAS_MASECHTOT[idx].pages - 1;

  if (dafNum < startDaf || dafNum > lastDaf) return null;
  if (dafNum === lastDaf && amud === 'b' && doesMasechetEndOnAmudA(normalized)) return null;

  return startId + (dafNum - startDaf) * 2 + (amud === 'b' ? 1 : 0);
}
