import { numberToGematria } from '../data/shas';
import type { Amud } from './dafNavigation';

export interface SefariaChapterLocation {
  dafNum: number;
  amud: Amud;
  line: number;
}

export interface SefariaChapter {
  n: number;
  heTitle: string;
  start: SefariaChapterLocation;
  end: SefariaChapterLocation;
}

export interface SefariaChapterEvent {
  kind: 'start' | 'end';
  segmentIndex: number;
  n: number;
  heTitle: string;
  isMasechetEnd?: boolean;
  masechetHe?: string;
}

export interface ChapterStartBlock {
  kind: 'chapterStart';
  titleHe: string;
  chapterNumber?: number;
}

export interface ChapterEndBlock {
  kind: 'chapterEnd';
  titleHe: string;
  isMasechetEnd?: boolean;
  masechetHe?: string;
}

export type ContentBlock<T> =
  | { kind: 'paragraph'; item: T }
  | ChapterStartBlock
  | ChapterEndBlock;

export interface IndexedParagraph<T> {
  index: number;
  item: T;
}

const WHOLE_REF_PATTERN = /(\d+)([ab]):(\d+)-(\d+)([ab]):(\d+)/i;

export function parseSefariaWholeRef(
  wholeRef: string,
): { start: SefariaChapterLocation; end: SefariaChapterLocation } | null {
  const match = wholeRef.match(WHOLE_REF_PATTERN);
  if (!match) return null;

  const startAmud = match[2].toLowerCase();
  const endAmud = match[5].toLowerCase();
  if ((startAmud !== 'a' && startAmud !== 'b') || (endAmud !== 'a' && endAmud !== 'b')) {
    return null;
  }

  return {
    start: {
      dafNum: Number(match[1]),
      amud: startAmud,
      line: Number(match[3]),
    },
    end: {
      dafNum: Number(match[4]),
      amud: endAmud,
      line: Number(match[6]),
    },
  };
}

export function parseSefariaChapterNodes(nodes: unknown[]): SefariaChapter[] {
  if (!Array.isArray(nodes)) return [];

  const chapters: SefariaChapter[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    const record = node as Record<string, unknown>;
    const wholeRef = typeof record.wholeRef === 'string' ? record.wholeRef : '';
    const parsed = parseSefariaWholeRef(wholeRef);
    if (!parsed) continue;

    const n = Number(record.numeric_equivalent);
    if (!Number.isFinite(n) || n <= 0) continue;

    const heTitle = typeof record.heTitle === 'string' ? record.heTitle.trim() : '';
    if (!heTitle) continue;

    chapters.push({ n, heTitle, start: parsed.start, end: parsed.end });
  }

  return chapters.sort((a, b) => a.n - b.n);
}

export function parseSefariaChaptersIndex(json: unknown): SefariaChapter[] {
  if (!json || typeof json !== 'object') return [];
  const alts = (json as { alts?: { Chapters?: { nodes?: unknown[] } } }).alts;
  const nodes = alts?.Chapters?.nodes;
  return parseSefariaChapterNodes(Array.isArray(nodes) ? nodes : []);
}

export function getChapterEventsForAmud(
  chapters: SefariaChapter[],
  dafNum: number,
  amud: Amud,
  segmentCount: number,
  masechetHe?: string,
): SefariaChapterEvent[] {
  if (chapters.length === 0) return [];

  const lastChapter = chapters[chapters.length - 1];
  const events: SefariaChapterEvent[] = [];
  const lastSegmentIndex = Math.max(0, segmentCount - 1);

  for (const chapter of chapters) {
    if (chapter.start.dafNum === dafNum && chapter.start.amud === amud) {
      events.push({
        kind: 'start',
        segmentIndex: Math.max(0, chapter.start.line - 1),
        n: chapter.n,
        heTitle: chapter.heTitle,
      });
    }

    if (chapter.end.dafNum === dafNum && chapter.end.amud === amud) {
      events.push({
        kind: 'end',
        segmentIndex: Math.min(lastSegmentIndex, Math.max(0, chapter.end.line - 1)),
        n: chapter.n,
        heTitle: chapter.heTitle,
        isMasechetEnd: chapter.n === lastChapter.n,
        masechetHe: chapter.n === lastChapter.n ? masechetHe : undefined,
      });
    }
  }

  return events;
}

export function insertChapterBoundaries<T>(
  paragraphs: Array<IndexedParagraph<T>>,
  events: SefariaChapterEvent[],
): Array<ContentBlock<T>> {
  const starts = events
    .filter((event) => event.kind === 'start')
    .sort((a, b) => a.segmentIndex - b.segmentIndex);
  const ends = events
    .filter((event) => event.kind === 'end')
    .sort((a, b) => a.segmentIndex - b.segmentIndex);

  const blocks: Array<ContentBlock<T>> = [];
  let startCursor = 0;
  let endCursor = 0;

  const emitStart = (event: SefariaChapterEvent) => {
    blocks.push({
      kind: 'chapterStart',
      titleHe: event.heTitle,
      chapterNumber: event.n,
    });
  };

  const emitEnd = (event: SefariaChapterEvent) => {
    blocks.push({
      kind: 'chapterEnd',
      titleHe: event.heTitle,
      isMasechetEnd: event.isMasechetEnd,
      masechetHe: event.masechetHe,
    });
  };

  for (const paragraph of paragraphs) {
    while (endCursor < ends.length && ends[endCursor].segmentIndex < paragraph.index) {
      emitEnd(ends[endCursor]);
      endCursor += 1;
    }
    while (startCursor < starts.length && starts[startCursor].segmentIndex <= paragraph.index) {
      emitStart(starts[startCursor]);
      startCursor += 1;
    }
    blocks.push({ kind: 'paragraph', item: paragraph.item });
  }

  while (endCursor < ends.length) {
    emitEnd(ends[endCursor]);
    endCursor += 1;
  }
  while (startCursor < starts.length) {
    emitStart(starts[startCursor]);
    startCursor += 1;
  }

  return blocks;
}

export function getChapterStartDisplay(
  titleHe: string,
  chapterNumber?: number,
): { heading: string; subtitle?: string } {
  if (chapterNumber != null && chapterNumber > 0) {
    const heading = `פרק ${numberToGematria(chapterNumber)}`;
    const subtitle = titleHe.trim();
    return subtitle ? { heading, subtitle } : { heading };
  }

  const trimmed = titleHe.trim();
  const dash = trimmed.match(/^(פרק\s+\S+)\s*[-–—]\s*(.+)$/);
  if (dash) {
    return { heading: dash[1], subtitle: dash[2] };
  }

  return { heading: trimmed };
}

export function getChapterEndDisplay(
  titleHe: string,
  isMasechetEnd?: boolean,
  masechetHe?: string,
): { heading: string; subtitle?: string } {
  const name = titleHe.trim();
  const heading = name ? `הדרן עלך פרק ${name}` : 'הדרן עלך';
  if (!isMasechetEnd) {
    return { heading };
  }

  const masechet = masechetHe?.trim();
  return {
    heading,
    subtitle: masechet ? `וסליקא לה מסכת ${masechet}` : 'וסליקא לה',
  };
}
