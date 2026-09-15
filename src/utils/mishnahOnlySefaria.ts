import {
  KINNIM_CHAPTER_MISHNAH_COUNTS,
  KINNIM_CHAPTER_NAMES,
  KINNIM_DAF_RANGES,
  KINNIM_SEFARIA_BOOK,
  MIDDOT_CHAPTER_MISHNAH_COUNTS,
  MIDDOT_CHAPTER_NAMES,
  MIDDOT_DAF_RANGES,
  MIDDOT_SEFARIA_BOOK,
  type MishnahDafRange,
} from '../data/mishnahOnlyDafYomi';
import { numberToGematria } from '../data/shas';
import type { SefariaChapterEvent } from './chapterBoundaries';

export type Amud = 'a' | 'b';

export interface MishnahAddress {
  chapter: number;
  mishnah: number;
}

export interface MishnahDafSlot {
  dafNum: number;
  amud: Amud;
  apiTref: string;
  startChapter: number;
  endChapter: number;
  spansChapters: boolean;
}

export const TAMID_START_DAF = 25;

function normalizedName(masechetEn: string): string {
  return masechetEn.trim().toLowerCase();
}

export function isKinnimMasechet(masechetEn: string): boolean {
  const name = normalizedName(masechetEn);
  return name === 'kinnim' || masechetEn.trim() === 'קינים';
}

export function isMidotMasechet(masechetEn: string): boolean {
  const name = normalizedName(masechetEn);
  return name === 'midot' || name === 'middot' || masechetEn.trim() === 'מדות';
}

export function isTamidMasechet(masechetEn: string): boolean {
  const name = normalizedName(masechetEn);
  return name === 'tamid' || masechetEn.trim() === 'תמיד';
}

export function isKinnimTamidSharedAmud(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
): boolean {
  if (dafNum !== TAMID_START_DAF || amud !== 'b') return false;
  return isKinnimMasechet(masechetEn) || isTamidMasechet(masechetEn);
}

export function isTamidStartAmud(masechetEn: string, dafNum: number, amud: Amud): boolean {
  return isTamidMasechet(masechetEn) && dafNum === TAMID_START_DAF && amud === 'b';
}

export function isTamidStartDaf(masechetEn: string, dafNum: number): boolean {
  return isTamidMasechet(masechetEn) && dafNum === TAMID_START_DAF;
}

export function isMishnahOnlySlot(masechetEn: string, dafNum: number, amud: Amud): boolean {
  if (isMidotMasechet(masechetEn)) return true;
  if (!isKinnimMasechet(masechetEn)) return false;
  return !(dafNum === TAMID_START_DAF && amud === 'b');
}

function rangesForMasechet(masechetEn: string): readonly MishnahDafRange[] | null {
  if (isKinnimMasechet(masechetEn)) return KINNIM_DAF_RANGES;
  if (isMidotMasechet(masechetEn)) return MIDDOT_DAF_RANGES;
  return null;
}

function bookForMasechet(masechetEn: string): string | null {
  if (isKinnimMasechet(masechetEn)) return KINNIM_SEFARIA_BOOK;
  if (isMidotMasechet(masechetEn)) return MIDDOT_SEFARIA_BOOK;
  return null;
}

function chapterNamesForMasechet(masechetEn: string): readonly string[] {
  if (isKinnimMasechet(masechetEn)) return KINNIM_CHAPTER_NAMES;
  if (isMidotMasechet(masechetEn)) return MIDDOT_CHAPTER_NAMES;
  return [];
}

function chapterMishnahCountsForMasechet(masechetEn: string): readonly number[] {
  if (isKinnimMasechet(masechetEn)) return KINNIM_CHAPTER_MISHNAH_COUNTS;
  if (isMidotMasechet(masechetEn)) return MIDDOT_CHAPTER_MISHNAH_COUNTS;
  return [];
}

export function expandMishnahRange(
  range: string,
  chapterCounts: readonly number[],
): MishnahAddress[] {
  const parsed = parseMishnahRange(range);
  if (!parsed) return [];

  const addresses: MishnahAddress[] = [];
  let chapter = parsed.start.chapter;
  let mishnah = parsed.start.mishnah;

  while (chapter < parsed.end.chapter || (chapter === parsed.end.chapter && mishnah <= parsed.end.mishnah)) {
    addresses.push({ chapter, mishnah });
    mishnah += 1;
    const chapterLen = chapterCounts[chapter - 1];
    if (chapterLen != null && mishnah > chapterLen) {
      chapter += 1;
      mishnah = 1;
    }
    if (addresses.length > 40) break;
  }

  return addresses;
}

export function mishnahAddressesForPage(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
): MishnahAddress[] {
  const ranges = rangesForMasechet(masechetEn);
  const counts = chapterMishnahCountsForMasechet(masechetEn);
  if (!ranges || counts.length === 0) return [];

  const entry = ranges.find((item) => item.dafNum === dafNum && item.amud === amud);
  if (!entry) return [];

  return expandMishnahRange(entry.range, counts);
}

export function mishnahLabelHe(mishnah: number): string {
  const gem = numberToGematria(mishnah);
  return gem ? `משנה ${gem}` : '';
}

export function parseMishnahRange(range: string): {
  start: MishnahAddress;
  end: MishnahAddress;
} | null {
  const trimmed = range.trim();
  if (!trimmed) return null;

  const [leftRaw, rightRaw] = trimmed.split('-');
  const left = leftRaw.split('.').map(Number);
  if (left.length < 2 || left.some((part) => !Number.isFinite(part) || part <= 0)) {
    return null;
  }

  const start: MishnahAddress = { chapter: left[0], mishnah: left[1] };
  if (!rightRaw) {
    return { start, end: { ...start } };
  }

  const right = rightRaw.split('.').map(Number);
  if (right.length === 0 || right.some((part) => !Number.isFinite(part) || part <= 0)) {
    return null;
  }

  if (right.length === 1) {
    return { start, end: { chapter: start.chapter, mishnah: right[0] } };
  }

  return { start, end: { chapter: right[0], mishnah: right[1] } };
}

export function getMishnahDafSlot(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
): MishnahDafSlot | null {
  const ranges = rangesForMasechet(masechetEn);
  const book = bookForMasechet(masechetEn);
  if (!ranges || !book) return null;

  const entry = ranges.find((item) => item.dafNum === dafNum && item.amud === amud);
  if (!entry) return null;

  const parsed = parseMishnahRange(entry.range);
  if (!parsed) return null;

  return {
    dafNum,
    amud,
    apiTref: `${book}.${entry.range}`,
    startChapter: parsed.start.chapter,
    endChapter: parsed.end.chapter,
    spansChapters: parsed.start.chapter !== parsed.end.chapter,
  };
}

export function buildMishnahOnlySefariaTref(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
): string | null {
  return getMishnahDafSlot(masechetEn, dafNum, amud)?.apiTref ?? null;
}

export function mishnahChapterName(masechetEn: string, n: number): string {
  const names = chapterNamesForMasechet(masechetEn);
  return names[n - 1] ?? `פרק ${n}`;
}

export function spanningMishnahSplitIndex(he: unknown): number | null {
  if (!Array.isArray(he) || he.length < 2) return null;
  if (!Array.isArray(he[0])) return null;

  const countStrings = (value: unknown): number => {
    if (typeof value === 'string') return value.trim() ? 1 : 0;
    if (!Array.isArray(value)) return 0;
    return value.reduce<number>((sum, item) => sum + countStrings(item), 0);
  };

  const firstLen = countStrings(he[0]);
  return firstLen > 0 ? firstLen : null;
}

export function buildMishnahOnlyChapterEvents(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  segmentCount: number,
  splitIndex: number | null,
): SefariaChapterEvent[] {
  const ranges = rangesForMasechet(masechetEn);
  const slot = getMishnahDafSlot(masechetEn, dafNum, amud);
  if (!ranges || !slot || segmentCount <= 0) return [];

  const index = ranges.findIndex((item) => item.dafNum === dafNum && item.amud === amud);
  if (index < 0) return [];

  const lastSegmentIndex = segmentCount - 1;
  const prev = index > 0 ? getMishnahDafSlot(masechetEn, ranges[index - 1].dafNum, ranges[index - 1].amud) : null;
  const next =
    index + 1 < ranges.length
      ? getMishnahDafSlot(masechetEn, ranges[index + 1].dafNum, ranges[index + 1].amud)
      : null;
  const names = chapterNamesForMasechet(masechetEn);
  const masechetHe = isKinnimMasechet(masechetEn) ? 'קינים' : 'מדות';
  const events: SefariaChapterEvent[] = [];

  const pushStart = (n: number, segmentIndex: number) => {
    events.push({
      kind: 'start',
      segmentIndex,
      n,
      heTitle: mishnahChapterName(masechetEn, n),
    });
  };

  const pushEnd = (n: number, segmentIndex: number) => {
    const isMasechetEnd = n === names.length;
    events.push({
      kind: 'end',
      segmentIndex,
      n,
      heTitle: mishnahChapterName(masechetEn, n),
      ...(isMasechetEnd ? { isMasechetEnd: true, masechetHe } : {}),
    });
  };

  if (slot.spansChapters) {
    const split =
      splitIndex != null && splitIndex > 0 && splitIndex <= lastSegmentIndex
        ? splitIndex
        : Math.max(1, Math.min(lastSegmentIndex, Math.floor(segmentCount / 2)));
    pushEnd(slot.startChapter, split - 1);
    pushStart(slot.endChapter, split);
    if (!next) {
      pushEnd(slot.endChapter, lastSegmentIndex);
    }
    return events;
  }

  const alreadyOpened =
    Boolean(prev?.spansChapters && prev.endChapter === slot.startChapter) ||
    prev?.endChapter === slot.startChapter;
  if (!alreadyOpened) {
    pushStart(slot.startChapter, 0);
  }

  const continuesAfter =
    Boolean(next?.spansChapters && next.startChapter === slot.endChapter) ||
    next?.startChapter === slot.endChapter;
  if (!continuesAfter) {
    pushEnd(slot.endChapter, lastSegmentIndex);
  }

  return events;
}

export function resolveChavrutaLocation(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
): { masechetEn: string; dafNum: number; amud: Amud } {
  if (isKinnimTamidSharedAmud(masechetEn, dafNum, amud)) {
    return { masechetEn: 'Tamid', dafNum: TAMID_START_DAF, amud: 'b' };
  }
  const name = masechetEn.trim();
  if (name.toLowerCase() === 'middot') return { masechetEn: 'Midot', dafNum, amud };
  return { masechetEn: name, dafNum, amud };
}

export function readerDisplayMasechetHe(
  masechetEn: string,
  dafNum: number,
  amud: Amud,
  fallbackHe?: string,
): string | undefined {
  if (isKinnimTamidSharedAmud(masechetEn, dafNum, amud)) {
    return 'תמיד';
  }
  return fallbackHe;
}

export function isKinnimTamidSharedCalendarDaf(masechetHe: string, dafNum: number): boolean {
  return isKinnimMasechet(masechetHe) && dafNum === TAMID_START_DAF;
}

export function kinnimTamidCalendarDisplay(
  masechetHe: string,
  dafNum: number,
): { masechetHe: string; subtitleHe: string } | null {
  if (!isKinnimTamidSharedCalendarDaf(masechetHe, dafNum)) return null;
  return {
    masechetHe: 'קינים ותמיד',
    subtitleHe: 'קינים ע״א · תמיד ע״ב',
  };
}

export function dafYomiDisplayMasechetHe(masechetHe: string, dafNum: number): string {
  return kinnimTamidCalendarDisplay(masechetHe, dafNum)?.masechetHe ?? masechetHe;
}
