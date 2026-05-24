import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';

export type Amud = 'a' | 'b';

export interface DafLocation {
  masechetEn: string;
  dafNum: number;
  amud: Amud;
}

const HEBCAL_TO_SEFARIA: Record<string, string> = {
  Berakhot: 'Berakhot',
  Berachot: 'Berakhot',
  Eiruvin: 'Eruvin',
  Gitin: 'Gitin',
  Chullin: 'Chullin',
  "Bava Kamma": 'Baba Kamma',
  "Bava Metzia": 'Baba Metzia',
  "Bava Batra": 'Baba Batra',
  "Avodah Zarah": 'Avodah Zarah',
  "Moed Katan": 'Moed Katan',
  "Rosh Hashanah": 'Rosh Hashana',
  Taanit: 'Taanit',
  Shekalim: 'Shekalim',
};

const FIRST_DAF = 2;

export function normalizeMasechetEn(name: string): string {
  const trimmed = name.trim();
  if (HEBCAL_TO_SEFARIA[trimmed]) return HEBCAL_TO_SEFARIA[trimmed];

  const fromShas = SHAS_MASECHTOT.find(
    (m) => m.en.toLowerCase() === trimmed.toLowerCase()
  );
  if (fromShas) return fromShas.en;

  return trimmed;
}

function sefariaRefName(masechetEn: string): string {
  return normalizeMasechetEn(masechetEn).replace(/ /g, '_');
}

export function buildSefariaTref(masechetEn: string, dafNum: number, amud: Amud): string {
  return `${sefariaRefName(masechetEn)}.${dafNum}${amud}`;
}

export function buildSefariaTextUrl(masechetEn: string, dafNum: number, amud: Amud): string {
  return `https://www.sefaria.org/${buildSefariaTref(masechetEn, dafNum, amud)}?lang=he`;
}

function findMasechetIndex(masechetEn: string): number {
  const normalized = normalizeMasechetEn(masechetEn);
  return SHAS_MASECHTOT.findIndex((m) => m.en === normalized);
}

function lastDafNum(masechetEn: string): number {
  const idx = findMasechetIndex(masechetEn);
  if (idx === -1) return FIRST_DAF;
  return FIRST_DAF + SHAS_MASECHTOT[idx].pages - 1;
}

function firstLocationForMasechet(masechetEn: string): DafLocation {
  return { masechetEn: normalizeMasechetEn(masechetEn), dafNum: FIRST_DAF, amud: 'a' };
}

function lastLocationForMasechet(masechetEn: string): DafLocation {
  return { masechetEn: normalizeMasechetEn(masechetEn), dafNum: lastDafNum(masechetEn), amud: 'b' };
}

export function formatDafLabel(dafNum: number, amud: Amud): string {
  const gem = numberToGematria(dafNum);
  return amud === 'a' ? `דף ${gem} ע״א` : `דף ${gem} ע״ב`;
}

export function getNextAmud(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);
  const lastDaf = lastDafNum(masechetEn);

  if (loc.amud === 'a') {
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

  if (loc.amud === 'b') {
    return { masechetEn, dafNum: loc.dafNum, amud: 'a' };
  }

  if (loc.dafNum > FIRST_DAF) {
    return { masechetEn, dafNum: loc.dafNum - 1, amud: 'b' };
  }

  const idx = findMasechetIndex(masechetEn);
  if (idx <= 0) return null;
  return lastLocationForMasechet(SHAS_MASECHTOT[idx - 1].en);
}

export function getNextDaf(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);
  const lastDaf = lastDafNum(masechetEn);

  if (loc.dafNum < lastDaf) {
    return { masechetEn, dafNum: loc.dafNum + 1, amud: 'a' };
  }

  const idx = findMasechetIndex(masechetEn);
  if (idx === -1 || idx >= SHAS_MASECHTOT.length - 1) return null;
  return firstLocationForMasechet(SHAS_MASECHTOT[idx + 1].en);
}

export function getPrevDaf(loc: DafLocation): DafLocation | null {
  const masechetEn = normalizeMasechetEn(loc.masechetEn);

  if (loc.dafNum > FIRST_DAF) {
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
