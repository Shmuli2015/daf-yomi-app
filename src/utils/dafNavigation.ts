import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';
import { getMasechetDafim, doesMasechetEndOnAmudA, isAmudAvailable } from './shas';
import {
  isTamidMasechet,
  isTamidStartAmud,
  isTamidStartDaf,
  TAMID_START_DAF,
} from './mishnahOnlySefaria';

export type Amud = 'a' | 'b';

export interface DafLocation {
  masechetEn: string;
  dafNum: number;
  amud: Amud;
}

const ALIASES_TO_SHAS: Record<string, string> = {
  Berakhot: 'Berachot',
  Eiruvin: 'Eruvin',
  Gittin: 'Gitin',
  Chullin: 'Chullin',
  "Bava Kamma": 'Baba Kamma',
  "Bava Metzia": 'Baba Metzia',
  "Bava Batra": 'Baba Batra',
  "Avodah Zarah": 'Avodah Zarah',
  "Moed Katan": 'Moed Katan',
  "Rosh Hashanah": 'Rosh Hashana',
  Taanit: 'Taanit',
  Shekalim: 'Shekalim',
  Bekhorot: 'Bechorot',
  Arakhin: 'Arachin',
  Middot: 'Midot',
};

const SHAS_TO_SEFARIA: Record<string, string> = {
  Berachot: 'Berakhot',
  Gitin: 'Gittin',
  'Baba Kamma': 'Bava Kamma',
  'Baba Metzia': 'Bava Metzia',
  'Baba Batra': 'Bava Batra',
  'Rosh Hashana': 'Rosh Hashanah',
  Bechorot: 'Bekhorot',
  Arachin: 'Arakhin',
  Midot: 'Middot',
};

const FIRST_DAF = 2;

export function normalizeMasechetEn(name: string): string {
  const trimmed = name.trim();
  if (ALIASES_TO_SHAS[trimmed]) return ALIASES_TO_SHAS[trimmed];

  const fromShas = SHAS_MASECHTOT.find(
    (m) => m.en.toLowerCase() === trimmed.toLowerCase()
  );
  if (fromShas) return fromShas.en;

  return trimmed;
}

function sefariaRefName(masechetEn: string): string {
  const shasName = normalizeMasechetEn(masechetEn);
  const sefariaName = SHAS_TO_SEFARIA[shasName] ?? shasName;
  return sefariaName.replace(/ /g, '_');
}

export function getSefariaBookTitle(masechetEn: string): string {
  return sefariaRefName(masechetEn);
}

export function buildSefariaTref(masechetEn: string, dafNum: number, amud: Amud): string {
  return `${sefariaRefName(masechetEn)}.${dafNum}${amud}`;
}

function findMasechetIndex(masechetEn: string): number {
  const normalized = normalizeMasechetEn(masechetEn);
  return SHAS_MASECHTOT.findIndex((m) => m.en === normalized);
}

function firstDafNum(masechetEn: string): number {
  const dafim = getMasechetDafim(masechetEn);
  if (dafim.length > 0) return dafim[0];
  return FIRST_DAF;
}

function lastDafNum(masechetEn: string): number {
  const dafim = getMasechetDafim(masechetEn);
  if (dafim.length > 0) return dafim[dafim.length - 1];
  const idx = findMasechetIndex(masechetEn);
  if (idx === -1) return FIRST_DAF;
  return FIRST_DAF + SHAS_MASECHTOT[idx].pages - 1;
}

function firstLocationForMasechet(masechetEn: string): DafLocation {
  return { masechetEn: normalizeMasechetEn(masechetEn), dafNum: firstDafNum(masechetEn), amud: 'a' };
}

function lastLocationForMasechet(masechetEn: string): DafLocation {
  const norm = normalizeMasechetEn(masechetEn);
  const lastDaf = lastDafNum(norm);
  const lastAmud: Amud = doesMasechetEndOnAmudA(norm) ? 'a' : 'b';
  return { masechetEn: norm, dafNum: lastDaf, amud: lastAmud };
}

export function formatDafLabel(dafNum: number, amud: Amud): string {
  const gem = numberToGematria(dafNum);
  return amud === 'a' ? `דף ${gem} ע״א` : `דף ${gem} ע״ב`;
}

export function getNextAmud(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);

  if (isTamidStartAmud(masechetEn, loc.dafNum, loc.amud)) {
    return { masechetEn, dafNum: loc.dafNum + 1, amud: 'a' };
  }

  const lastDaf = lastDafNum(masechetEn);

  if (loc.amud === 'a') {
    if (loc.dafNum === lastDaf && doesMasechetEndOnAmudA(masechetEn)) {
      const idx = findMasechetIndex(masechetEn);
      if (idx === -1 || idx >= SHAS_MASECHTOT.length - 1) return null;
      return firstLocationForMasechet(SHAS_MASECHTOT[idx + 1].en);
    }
    return { masechetEn, dafNum: loc.dafNum, amud: 'b' };
  }

  if (loc.dafNum < lastDaf) {
    return { masechetEn, dafNum: loc.dafNum + 1, amud: 'a' };
  }

  const idx = findMasechetIndex(masechetEn);
  if (idx === -1 || idx >= SHAS_MASECHTOT.length - 1) return null;
  return firstLocationForMasechet(SHAS_MASECHTOT[idx + 1].en);
}

export function getPrevAmud(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);

  if (isTamidStartAmud(masechetEn, loc.dafNum, loc.amud)) {
    return { masechetEn: 'Kinnim', dafNum: TAMID_START_DAF, amud: 'a' };
  }

  if (isTamidMasechet(masechetEn) && loc.dafNum === TAMID_START_DAF + 1 && loc.amud === 'a') {
    return { masechetEn, dafNum: TAMID_START_DAF, amud: 'b' };
  }

  const firstDaf = firstDafNum(masechetEn);

  if (loc.amud === 'b') {
    if (!isAmudAvailable(masechetEn, loc.dafNum, 'a')) {
      const idx = findMasechetIndex(masechetEn);
      if (idx <= 0) return null;
      return lastLocationForMasechet(SHAS_MASECHTOT[idx - 1].en);
    }
    return { masechetEn, dafNum: loc.dafNum, amud: 'a' };
  }

  if (loc.dafNum > firstDaf) {
    return { masechetEn, dafNum: loc.dafNum - 1, amud: 'b' };
  }

  const idx = findMasechetIndex(masechetEn);
  if (idx <= 0) return null;
  return lastLocationForMasechet(SHAS_MASECHTOT[idx - 1].en);
}

export function getNextDaf(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);
  const lastDaf = lastDafNum(masechetEn);

  if (isTamidStartDaf(masechetEn, loc.dafNum)) {
    return { masechetEn, dafNum: loc.dafNum + 1, amud: 'a' };
  }

  if (loc.dafNum < lastDaf) {
    return { masechetEn, dafNum: loc.dafNum + 1, amud: 'a' };
  }

  const idx = findMasechetIndex(masechetEn);
  if (idx === -1 || idx >= SHAS_MASECHTOT.length - 1) return null;
  return firstLocationForMasechet(SHAS_MASECHTOT[idx + 1].en);
}

export function getPrevDaf(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);
  const firstDaf = firstDafNum(masechetEn);

  if (isTamidStartDaf(masechetEn, loc.dafNum)) {
    return { masechetEn: 'Kinnim', dafNum: TAMID_START_DAF, amud: 'a' };
  }

  if (isTamidMasechet(masechetEn) && loc.dafNum === firstDaf) {
    return { masechetEn, dafNum: TAMID_START_DAF, amud: 'b' };
  }

  if (loc.dafNum > firstDaf) {
    return { masechetEn, dafNum: loc.dafNum - 1, amud: 'a' };
  }

  const idx = findMasechetIndex(masechetEn);
  if (idx <= 0) return null;
  return firstLocationForMasechet(SHAS_MASECHTOT[idx - 1].en);
}

export function parseDafEn(dafEn: string): { dafNum: number; amud: Amud } {
  const match = dafEn.match(/^(\d+)([ab])?$/i);
  if (!match) {
    const num = parseInt(dafEn, 10);
    return { dafNum: isNaN(num) ? FIRST_DAF : num, amud: 'a' };
  }
  return { dafNum: parseInt(match[1], 10), amud: (match[2]?.toLowerCase() as Amud) || 'a' };
}

export function locationFromDafInfo(masechetEn: string, dafEn: string): DafLocation {
  const { dafNum, amud } = parseDafEn(dafEn);
  return { masechetEn: normalizeMasechetEn(masechetEn), dafNum, amud };
}
