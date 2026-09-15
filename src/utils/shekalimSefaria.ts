import {
  SHEKALIM_CHAPTER_NAMES,
  SHEKALIM_DAF_YOMI_RANGES,
  SHEKALIM_SEFARIA_BOOK,
} from '../data/shekalimDafYomi';
import type { SefariaChapterEvent } from './chapterBoundaries';
import { normalizeMasechetEn, type Amud } from './dafNavigation';

export interface YerushalmiAddress {
  chapter: number;
  halakha: number;
  segment: number;
}

export interface ShekalimDafSlot {
  dafNum: number;
  amud: Amud;
  apiTref: string;
  startChapter: number;
  endChapter: number;
  spansChapters: boolean;
}

export function isShekalimMasechet(masechetEn: string): boolean {
  return normalizeMasechetEn(masechetEn) === 'Shekalim';
}

export function parseYerushalmiRange(range: string): {
  start: YerushalmiAddress;
  end: YerushalmiAddress;
} | null {
  const trimmed = range.trim();
  if (!trimmed) return null;

  const [leftRaw, rightRaw] = trimmed.split('-');
  const left = leftRaw.split(':').map(Number);
  if (left.length === 0 || left.some((part) => !Number.isFinite(part) || part <= 0)) {
    return null;
  }

  const start: YerushalmiAddress = {
    chapter: left[0],
    halakha: left[1] ?? 1,
    segment: left[2] ?? 1,
  };

  if (!rightRaw) {
    return { start, end: { ...start } };
  }

  const right = rightRaw.split(':').map(Number);
  if (right.length === 0 || right.some((part) => !Number.isFinite(part) || part <= 0)) {
    return null;
  }

  const prefix = left.slice(0, Math.max(0, left.length - right.length));
  const endParts = [...prefix, ...right];
  return {
    start,
    end: {
      chapter: endParts[0],
      halakha: endParts[1] ?? 1,
      segment: endParts[2] ?? 1,
    },
  };
}

export function shekalimSlotIndex(dafNum: number, amud: Amud): number {
  return (dafNum - 2) * 2 + (amud === 'b' ? 1 : 0);
}

function locationFromIndex(index: number): { dafNum: number; amud: Amud } {
  return {
    dafNum: 2 + Math.floor(index / 2),
    amud: index % 2 === 0 ? 'a' : 'b',
  };
}

export function getShekalimDafSlot(dafNum: number, amud: Amud): ShekalimDafSlot | null {
  const index = shekalimSlotIndex(dafNum, amud);
  if (index < 0 || index >= SHEKALIM_DAF_YOMI_RANGES.length) {
    return null;
  }

  const range = SHEKALIM_DAF_YOMI_RANGES[index];
  const parsed = parseYerushalmiRange(range);
  if (!parsed) return null;

  return {
    dafNum,
    amud,
    apiTref: `${SHEKALIM_SEFARIA_BOOK}.${range.replace(/:/g, '.')}`,
    startChapter: parsed.start.chapter,
    endChapter: parsed.end.chapter,
    spansChapters: parsed.start.chapter !== parsed.end.chapter,
  };
}

export function buildShekalimSefariaTref(dafNum: number, amud: Amud): string | null {
  return getShekalimDafSlot(dafNum, amud)?.apiTref ?? null;
}

export function shekalimChapterName(n: number): string {
  return SHEKALIM_CHAPTER_NAMES[n - 1] ?? `פרק ${n}`;
}

export function spanningSplitIndex(he: unknown): number | null {
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

export function buildShekalimChapterEvents(
  dafNum: number,
  amud: Amud,
  segmentCount: number,
  splitIndex: number | null,
  masechetHe = 'שקלים',
): SefariaChapterEvent[] {
  const index = shekalimSlotIndex(dafNum, amud);
  const slot = getShekalimDafSlot(dafNum, amud);
  if (!slot || segmentCount <= 0) return [];

  const lastSegmentIndex = segmentCount - 1;
  const prevLoc = index > 0 ? locationFromIndex(index - 1) : null;
  const nextLoc =
    index + 1 < SHEKALIM_DAF_YOMI_RANGES.length ? locationFromIndex(index + 1) : null;
  const prev = prevLoc ? getShekalimDafSlot(prevLoc.dafNum, prevLoc.amud) : null;
  const next = nextLoc ? getShekalimDafSlot(nextLoc.dafNum, nextLoc.amud) : null;
  const events: SefariaChapterEvent[] = [];

  const pushStart = (n: number, segmentIndex: number) => {
    events.push({
      kind: 'start',
      segmentIndex,
      n,
      heTitle: shekalimChapterName(n),
    });
  };

  const pushEnd = (n: number, segmentIndex: number) => {
    const isMasechetEnd = n === SHEKALIM_CHAPTER_NAMES.length;
    events.push({
      kind: 'end',
      segmentIndex,
      n,
      heTitle: shekalimChapterName(n),
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

function yerushalmiRefTail(ref: string): string | null {
  const match = ref.trim().match(/(\d+(?::\d+)*)(?:-(\d+(?::\d+)*))?$/);
  if (!match) return null;
  return match[2] ? `${match[1]}-${match[2]}` : match[1];
}

export function parseYerushalmiAddressFromRef(ref: string): YerushalmiAddress | null {
  const tail = yerushalmiRefTail(ref);
  return tail ? parseYerushalmiRange(tail)?.start ?? null : null;
}

export function expandYerushalmiRefAddresses(ref: string): YerushalmiAddress[] {
  const tail = yerushalmiRefTail(ref);
  const parsed = tail ? parseYerushalmiRange(tail) : null;
  if (!parsed) return [];

  if (
    parsed.start.chapter === parsed.end.chapter &&
    parsed.start.halakha === parsed.end.halakha
  ) {
    const addresses: YerushalmiAddress[] = [];
    for (let segment = parsed.start.segment; segment <= parsed.end.segment; segment += 1) {
      addresses.push({
        chapter: parsed.start.chapter,
        halakha: parsed.start.halakha,
        segment,
      });
    }
    return addresses;
  }

  return [parsed.start];
}

export function yerushalmiAddressKey(address: YerushalmiAddress): string {
  return `${address.chapter}:${address.halakha}:${address.segment}`;
}

export function collectCommentarySegmentGroups(he: unknown): string[][] {
  if (he == null) return [];
  if (typeof he === 'string') return he.trim() ? [[he]] : [];
  if (!Array.isArray(he)) return [];

  const hasNestedArray = he.some((item) => Array.isArray(item));
  if (!hasNestedArray) {
    return [he.filter((item): item is string => typeof item === 'string')];
  }

  return he.flatMap((item) => collectCommentarySegmentGroups(item));
}

export function gemaraAddressesForPage(
  flattenedCount: number,
  sections: unknown,
  toSections: unknown,
  spanningRefs: unknown,
): YerushalmiAddress[] {
  if (Array.isArray(spanningRefs) && spanningRefs.length > 0) {
    const addresses = spanningRefs.flatMap((ref) =>
      typeof ref === 'string' ? expandYerushalmiRefAddresses(ref) : [],
    );
    if (addresses.length === flattenedCount) return addresses;
  }

  if (
    Array.isArray(sections) &&
    Array.isArray(toSections) &&
    sections.length >= 3 &&
    toSections.length >= 3
  ) {
    const startChapter = Number(sections[0]);
    const startHalakha = Number(sections[1]);
    const startSegment = Number(sections[2]);
    const endChapter = Number(toSections[0]);
    const endHalakha = Number(toSections[1]);
    const endSegment = Number(toSections[2]);
    if (
      startChapter === endChapter &&
      startHalakha === endHalakha &&
      Number.isFinite(startSegment) &&
      Number.isFinite(endSegment)
    ) {
      const addresses: YerushalmiAddress[] = [];
      for (let segment = startSegment; segment <= endSegment; segment += 1) {
        addresses.push({ chapter: startChapter, halakha: startHalakha, segment });
      }
      if (addresses.length === flattenedCount) return addresses;
    }
  }

  return [];
}

export function alignCommentaryToSegments(
  he: unknown,
  segmentCount: number,
  gemaraAddresses: YerushalmiAddress[],
  spanningRefs: unknown,
): Array<{ segIdx: number; texts: string[] }> {
  const groups = collectCommentarySegmentGroups(he);
  const refs = Array.isArray(spanningRefs)
    ? spanningRefs.filter((ref): ref is string => typeof ref === 'string')
    : [];

  if (refs.length === groups.length && gemaraAddresses.length === segmentCount) {
    const indexByKey = new Map(
      gemaraAddresses.map((address, index) => [yerushalmiAddressKey(address), index]),
    );
    const aligned: Array<{ segIdx: number; texts: string[] }> = [];
    groups.forEach((texts, index) => {
      const address = parseYerushalmiAddressFromRef(refs[index]);
      const segIdx = address ? indexByKey.get(yerushalmiAddressKey(address)) : undefined;
      if (segIdx == null) return;
      aligned.push({ segIdx, texts });
    });
    if (aligned.length > 0) return aligned;
  }

  if (groups.length === segmentCount) {
    return groups.map((texts, segIdx) => ({ segIdx, texts }));
  }

  return groups
    .map((texts, segIdx) => ({ segIdx, texts }))
    .filter((entry) => entry.segIdx < segmentCount);
}
