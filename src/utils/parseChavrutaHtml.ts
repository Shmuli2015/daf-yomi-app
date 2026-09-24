import type { ChapterEndBlock, ChapterStartBlock } from './chapterBoundaries';
import type { Amud } from './dafNavigation';

export interface ChavrutaFootnote {
  id: number;
  n: number;
  text: string;
}

export interface ChavrutaParagraph {
  text: string;
  footnoteRefs: number[];
}

export interface SectionHeaderBlock {
  kind: 'sectionHeader';
  titleHe: string;
}

export type ChavrutaBlock =
  | ({ kind: 'paragraph' } & ChavrutaParagraph)
  | ChapterStartBlock
  | ChapterEndBlock
  | SectionHeaderBlock;

export interface ChavrutaAmud {
  dafNum: number;
  amud: Amud;
  titleHe: string;
  blocks: ChavrutaBlock[];
  paragraphs: ChavrutaParagraph[];
  footnotes: ChavrutaFootnote[];
}

export type ChavrutaBodyPart =
  | { kind: 'text'; text: string; isGemara: boolean }
  | { kind: 'footnote'; id: number };

const GEMATRIA_VALUES: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50,
  ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
};

const DAF_HEADING_PATTERN = /<u>\s*דף\s+([^<>\-]+?)\s*-\s*([אב])\s*<\/u>/g;

const SECTION_HEADING_PATTERN = /<u>\s*([^<]{1,100}?)\s*<\/u>/gi;

const SECTION_DELIMITER_PATTERN =
  /<(?:b|u|span)\b[^>]*>(?:&nbsp;|\s)*(מתניתין|מתני['׳]|משנה|גמרא|גמ['׳]|הלכה)(?:&nbsp;|\s)*:?(?:&nbsp;|\s)*<\/(?:b|u|span)>/gi;

const SECTION_DELIMITER_TEXT_PATTERN =
  /^(?:מתניתין|מתני['׳]|משנה|גמרא|גמ['׳]|הלכה)\s*:?$/;

const BODY_START_MARKERS = ['<!--BODY_START-->', '<!--END_PARTIAL_PREFIX-->', '<!--_LSTART-->'];

const LEAKED_SECTION_TITLE_PATTERN = /^(פרק\s+\S|הקדמה|פתיחה|סוגית\s)/;

const HADARAN_PATTERN = /הדרן\s+עלך\s+(?:פרק\s+)?([^<]{1,80}?)(?=<|$)/gi;

const SALIKA_PATTERN = /וסליקא\s+לה\s+מסכת\s+([^<]{1,40}?)(?=<|$)/gi;

const MARKER_PATTERN =
  /<nobr>\s*<b\b[^>]*>(?:&nbsp;|\s)*(\d+)(\.?)(?:&nbsp;|\s)*<\/b>\s*<\/nobr>/gi;

const FOOTNOTE_TOKEN_PATTERN = /\[\[fn:(\d+)\]\]/g;

export function gematriaToNumber(value: string): number {
  const letters = value.replace(/[^\u05D0-\u05EA]/g, '');
  if (!letters) return 0;

  let total = 0;
  for (const letter of letters) {
    const letterValue = GEMATRIA_VALUES[letter];
    if (letterValue === undefined) return 0;
    total += letterValue;
  }
  return total;
}

export function buildAmudKey(dafNum: number, amud: Amud): string {
  return `${dafNum}${amud}`;
}

export function buildFootnoteToken(id: number): string {
  return `[[fn:${id}]]`;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '-')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '-')
    .replace(/&#x2013;/gi, '–')
    .replace(/&#x2014;/gi, '-')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/gi, '&');
}

function cleanText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?p\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '');

  return decodeEntities(withBreaks)
    .replace(/\u2014/g, '-')
    .replace(/--+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function markGemaraHtml(html: string): string {
  return html.replace(
    /<(b|strong|big)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_match, _tag, inner: string) => `**${inner}**`
  );
}

function cleanChavrutaText(html: string): string {
  return cleanText(markGemaraHtml(html));
}

function classifySpan(attributes: string): 'body' | 'note' | null {
  const normalized = attributes.replace(/\s+/g, ' ').toLowerCase();
  const fontSizeMatch = normalized.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
  const fontSize = fontSizeMatch ? Number(fontSizeMatch[1]) : null;
  const isBlue =
    /rgb\(\s*51\s*,\s*119\s*,\s*204\s*\)/.test(normalized) ||
    /#3377cc/.test(normalized) ||
    /#3366cc/.test(normalized);

  if (isBlue && (fontSize == null || fontSize <= 15)) {
    return 'note';
  }
  if (fontSize != null && fontSize >= 16) {
    return 'body';
  }
  return null;
}

function findSpanClose(html: string, startIndex: number): number {
  const tagPattern = /<\/?span\b[^>]*>/gi;
  tagPattern.lastIndex = startIndex;

  let depth = 1;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    if (match[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) return match.index;
    } else {
      depth += 1;
    }
  }
  return -1;
}

interface StyledSpan {
  kind: 'body' | 'note';
  inner: string;
}

function extractStyledSpans(html: string): StyledSpan[] {
  const spans: StyledSpan[] = [];
  const openPattern = /<span\b([^>]*)>/gi;
  let match: RegExpExecArray | null;

  while ((match = openPattern.exec(html)) !== null) {
    const kind = classifySpan(match[1] ?? '');
    if (!kind) continue;

    const innerStart = match.index + match[0].length;
    const innerEnd = findSpanClose(html, innerStart);
    if (innerEnd === -1) continue;

    spans.push({ kind, inner: html.slice(innerStart, innerEnd) });
    openPattern.lastIndex = innerEnd;
  }

  return spans;
}

function parseBodyParagraph(inner: string): ChavrutaParagraph | null {
  const footnoteRefs: number[] = [];

  const withTokens = inner.replace(MARKER_PATTERN, (full, digits: string, dot: string) => {
    if (dot) return full;
    const parsed = Number(digits);
    if (Number.isFinite(parsed) && !footnoteRefs.includes(parsed)) {
      footnoteRefs.push(parsed);
    }
    return parsed > 0 ? buildFootnoteToken(parsed) : ' ';
  });

  const text = cleanChavrutaText(withTokens);
  if (!text) return null;

  return { text, footnoteRefs };
}

function parseFootnoteSpan(inner: string): Array<Omit<ChavrutaFootnote, 'id'>> {
  const markers: Array<{ n: number; start: number; end: number }> = [];
  const pattern = new RegExp(MARKER_PATTERN.source, MARKER_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(inner)) !== null) {
    if (!match[2]) continue;
    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed)) continue;
    markers.push({ n: parsed, start: match.index, end: match.index + match[0].length });
  }

  return markers
    .map((marker, index) => {
      const sliceEnd = index + 1 < markers.length ? markers[index + 1].start : inner.length;
      return { n: marker.n, text: cleanChavrutaText(inner.slice(marker.end, sliceEnd)) };
    })
    .filter((footnote) => footnote.text.length > 0);
}

interface ParsedSection {
  blocks: ChavrutaBlock[];
  footnotes: Array<Omit<ChavrutaFootnote, 'id'>>;
}

function cleanMarkerTitle(raw: string): string {
  return decodeEntities(raw)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[:.,;]+$/g, '')
    .trim();
}

function isDafHeadingTitle(titleHe: string): boolean {
  return /^דף\s+\S+\s*-\s*[אב]\s*$/.test(titleHe);
}

function isSectionDelimiterTitle(text: string): boolean {
  return SECTION_DELIMITER_TEXT_PATTERN.test(text.trim());
}

function cleanSectionHeading(raw: string): string | null {
  const titleHe = cleanMarkerTitle(raw);
  if (!titleHe || isDafHeadingTitle(titleHe)) return null;
  return titleHe;
}

function isLeakedSectionTitle(plain: string): boolean {
  return plain.length <= 80 && !plain.includes('?') && LEAKED_SECTION_TITLE_PATTERN.test(plain);
}

function findBodyMarkerIndex(html: string): number {
  for (const marker of BODY_START_MARKERS) {
    const index = html.indexOf(marker);
    if (index >= 0) return index;
  }
  return -1;
}

function findPreambleStart(html: string, firstDafIndex: number): number {
  if (firstDafIndex <= 0) return firstDafIndex;

  const bodyMarker = findBodyMarkerIndex(html);
  const searchFrom = bodyMarker >= 0 && bodyMarker < firstDafIndex ? bodyMarker : 0;
  const slice = html.slice(searchFrom, firstDafIndex);
  const pattern = new RegExp(SECTION_HEADING_PATTERN.source, SECTION_HEADING_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(slice)) !== null) {
    const titleHe = cleanSectionHeading(match[1] ?? '');
    if (!titleHe) continue;
    return searchFrom + match.index;
  }

  if (bodyMarker >= 0 && bodyMarker < firstDafIndex) {
    return bodyMarker;
  }

  return firstDafIndex;
}

function cleanHadaranTitle(raw: string): string {
  return cleanMarkerTitle(raw)
    .split(/וסליקא|בריך/)[0]
    .trim()
    .replace(/^פרק\s+/, '')
    .trim();
}

function paragraphsFromBlocks(blocks: ChavrutaBlock[]): ChavrutaParagraph[] {
  return blocks
    .filter((block): block is { kind: 'paragraph' } & ChavrutaParagraph => block.kind === 'paragraph')
    .map(({ text, footnoteRefs }) => ({ text, footnoteRefs }));
}

function parseAmudSection(section: string): ParsedSection {
  const paragraphs: ChavrutaParagraph[] = [];
  const footnotes: Array<Omit<ChavrutaFootnote, 'id'>> = [];
  const seenFootnotes = new Set<number>();

  for (const span of extractStyledSpans(section)) {
    if (span.kind === 'body') {
      const paragraph = parseBodyParagraph(span.inner);
      if (paragraph) paragraphs.push(paragraph);
      continue;
    }

    for (const footnote of parseFootnoteSpan(span.inner)) {
      if (seenFootnotes.has(footnote.n)) continue;
      seenFootnotes.add(footnote.n);
      footnotes.push(footnote);
    }
  }

  footnotes.sort((a, b) => a.n - b.n);
  return {
    blocks: paragraphs.map((paragraph) => ({ kind: 'paragraph', ...paragraph })),
    footnotes,
  };
}

interface LocatedBoundary {
  index: number;
  end: number;
  block: ChapterStartBlock | ChapterEndBlock | SectionHeaderBlock;
}

function collectBoundaryMarkers(html: string): LocatedBoundary[] {
  const markers: LocatedBoundary[] = [];

  const startPattern = new RegExp(SECTION_HEADING_PATTERN.source, SECTION_HEADING_PATTERN.flags);
  let startMatch: RegExpExecArray | null;
  while ((startMatch = startPattern.exec(html)) !== null) {
    const titleHe = cleanSectionHeading(startMatch[1] ?? '');
    if (!titleHe) continue;
    if (isSectionDelimiterTitle(titleHe)) {
      markers.push({
        index: startMatch.index,
        end: startMatch.index + startMatch[0].length,
        block: { kind: 'sectionHeader', titleHe: cleanMarkerTitle(titleHe) },
      });
      continue;
    }
    markers.push({
      index: startMatch.index,
      end: startMatch.index + startMatch[0].length,
      block: { kind: 'chapterStart', titleHe },
    });
  }

  const delimiterPattern = new RegExp(
    SECTION_DELIMITER_PATTERN.source,
    SECTION_DELIMITER_PATTERN.flags
  );
  let delimMatch: RegExpExecArray | null;
  while ((delimMatch = delimiterPattern.exec(html)) !== null) {
    const rawTitle = delimMatch[1] ?? '';
    const titleHe = cleanMarkerTitle(rawTitle);
    if (!titleHe) continue;
    markers.push({
      index: delimMatch.index,
      end: delimMatch.index + delimMatch[0].length,
      block: { kind: 'sectionHeader', titleHe },
    });
  }

  const hadaranPattern = new RegExp(HADARAN_PATTERN.source, HADARAN_PATTERN.flags);
  let hadaranMatch: RegExpExecArray | null;
  while ((hadaranMatch = hadaranPattern.exec(html)) !== null) {
    const titleHe = cleanHadaranTitle(hadaranMatch[1] ?? '');
    markers.push({
      index: hadaranMatch.index,
      end: hadaranMatch.index + hadaranMatch[0].length,
      block: { kind: 'chapterEnd', titleHe },
    });
  }

  const salikaPattern = new RegExp(SALIKA_PATTERN.source, SALIKA_PATTERN.flags);
  let salikaMatch: RegExpExecArray | null;
  while ((salikaMatch = salikaPattern.exec(html)) !== null) {
    const masechetHe = cleanMarkerTitle(salikaMatch[1] ?? '');
    const nearbyEnd = [...markers]
      .reverse()
      .find(
        (marker) =>
          marker.block.kind === 'chapterEnd' &&
          marker.index <= salikaMatch!.index &&
          salikaMatch!.index - marker.end <= 300,
      );

    if (nearbyEnd && nearbyEnd.block.kind === 'chapterEnd') {
      nearbyEnd.block = {
        ...nearbyEnd.block,
        isMasechetEnd: true,
        masechetHe: masechetHe || nearbyEnd.block.masechetHe,
      };
      continue;
    }

    markers.push({
      index: salikaMatch.index,
      end: salikaMatch.index + salikaMatch[0].length,
      block: {
        kind: 'chapterEnd',
        titleHe: '',
        isMasechetEnd: true,
        masechetHe: masechetHe || undefined,
      },
    });
  }

  return markers.sort((a, b) => a.index - b.index || a.end - b.end);
}

function classifyLeakedParagraph(
  text: string
): ChapterStartBlock | ChapterEndBlock | SectionHeaderBlock | 'drop' | null {
  const plain = text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  if (!plain) return 'drop';
  if (isDafHeadingTitle(plain)) return 'drop';

  if (isSectionDelimiterTitle(plain)) {
    return { kind: 'sectionHeader', titleHe: cleanMarkerTitle(plain) };
  }

  if (isLeakedSectionTitle(plain)) {
    return { kind: 'chapterStart', titleHe: plain };
  }

  const hadaranMatch = plain.match(/^הדרן\s+עלך\s+(?:פרק\s+)?(.+)$/);
  if (hadaranMatch) {
    return { kind: 'chapterEnd', titleHe: cleanHadaranTitle(hadaranMatch[1]) };
  }

  const salikaMatch = plain.match(/^וסליקא\s+לה\s+מסכת\s+(.+)$/);
  if (salikaMatch) {
    return {
      kind: 'chapterEnd',
      titleHe: '',
      isMasechetEnd: true,
      masechetHe: cleanMarkerTitle(salikaMatch[1]),
    };
  }

  return null;
}

function blocksFromParsedSection(parsed: ParsedSection): ChavrutaBlock[] {
  const blocks: ChavrutaBlock[] = [];
  for (const block of parsed.blocks) {
    if (block.kind !== 'paragraph') {
      blocks.push(block);
      continue;
    }

    const leaked = classifyLeakedParagraph(block.text);
    if (leaked === 'drop') continue;
    if (leaked) {
      blocks.push(leaked);
      continue;
    }
    blocks.push(block);
  }
  return blocks;
}

function dedupeBoundaryBlocks(blocks: ChavrutaBlock[]): ChavrutaBlock[] {
  const result: ChavrutaBlock[] = [];
  for (const block of blocks) {
    const prev = result[result.length - 1];
    if (prev && block.kind !== 'paragraph' && prev.kind === block.kind) {
      if (block.kind === 'chapterStart' && prev.kind === 'chapterStart') {
        if (prev.titleHe === block.titleHe) continue;
      }
      if (block.kind === 'chapterEnd' && prev.kind === 'chapterEnd') {
        result[result.length - 1] = {
          kind: 'chapterEnd',
          titleHe: prev.titleHe || block.titleHe,
          isMasechetEnd: Boolean(prev.isMasechetEnd || block.isMasechetEnd),
          masechetHe: prev.masechetHe || block.masechetHe,
        };
        continue;
      }
      if (block.kind === 'sectionHeader' && prev.kind === 'sectionHeader') {
        if (prev.titleHe === block.titleHe) continue;
      }
    }
    result.push(block);
  }
  return result;
}

function parseSectionWithBoundaries(section: string): ParsedSection {
  const markers = collectBoundaryMarkers(section);
  if (markers.length === 0) {
    const parsed = parseAmudSection(section);
    return {
      blocks: dedupeBoundaryBlocks(blocksFromParsedSection(parsed)),
      footnotes: parsed.footnotes,
    };
  }

  const blocks: ChavrutaBlock[] = [];
  const footnotes: Array<Omit<ChavrutaFootnote, 'id'>> = [];
  let cursor = 0;

  const consumeSlice = (slice: string) => {
    if (!slice.trim()) return;
    const parsed = parseAmudSection(slice);
    blocks.push(...blocksFromParsedSection(parsed));
    for (const footnote of parsed.footnotes) {
      if (footnotes.some((item) => item.n === footnote.n)) continue;
      footnotes.push(footnote);
    }
  };

  for (const marker of markers) {
    if (marker.index < cursor) continue;
    consumeSlice(section.slice(cursor, marker.index));
    blocks.push(marker.block);
    cursor = marker.end;
  }
  consumeSlice(section.slice(cursor));

  footnotes.sort((a, b) => a.n - b.n);
  return {
    blocks: dedupeBoundaryBlocks(blocks),
    footnotes,
  };
}

type PendingBoundaryBlock = ChapterStartBlock | SectionHeaderBlock;

function peelTrailingChapterStarts(blocks: ChavrutaBlock[]): {
  blocks: ChavrutaBlock[];
  trailingStarts: PendingBoundaryBlock[];
} {
  let end = blocks.length;
  while (
    end > 0 &&
    (blocks[end - 1].kind === 'chapterStart' || blocks[end - 1].kind === 'sectionHeader')
  ) {
    end -= 1;
  }

  const trailingStarts = blocks
    .slice(end)
    .filter(
      (block): block is PendingBoundaryBlock =>
        block.kind === 'chapterStart' || block.kind === 'sectionHeader'
    );

  return { blocks: blocks.slice(0, end), trailingStarts };
}

function remapFootnoteTokens(text: string, idByDisplayNumber: Map<number, number>): string {
  return text.replace(FOOTNOTE_TOKEN_PATTERN, (full, digits: string) => {
    const id = idByDisplayNumber.get(Number(digits));
    return id == null ? '' : buildFootnoteToken(id);
  });
}

function remapSectionBlocks(
  section: ParsedSection,
  footnotes: ChavrutaFootnote[],
): ChavrutaBlock[] {
  const idByDisplayNumber = new Map<number, number>();

  for (const footnote of section.footnotes) {
    const id = footnotes.length + 1;
    idByDisplayNumber.set(footnote.n, id);
    footnotes.push({ id, n: footnote.n, text: footnote.text });
  }

  return section.blocks.map((block) => {
    if (block.kind !== 'paragraph') return block;
    return {
      kind: 'paragraph',
      text: remapFootnoteTokens(block.text, idByDisplayNumber).replace(/\s+/g, ' ').trim(),
      footnoteRefs: block.footnoteRefs
        .map((ref) => idByDisplayNumber.get(ref))
        .filter((id): id is number => id !== undefined),
    };
  });
}

function mergeSections(
  dafNum: number,
  amud: Amud,
  titleHe: string,
  sections: ParsedSection[],
): ChavrutaAmud {
  const footnotes: ChavrutaFootnote[] = [];
  const blocks = sections.flatMap((section) => remapSectionBlocks(section, footnotes));

  return {
    dafNum,
    amud,
    titleHe,
    blocks,
    paragraphs: paragraphsFromBlocks(blocks),
    footnotes,
  };
}

function firstSectionStart(
  html: string,
  heading: { matchIndex: number; contentStart: number },
): number {
  const preambleStart = findPreambleStart(html, heading.matchIndex);
  return preambleStart < heading.matchIndex ? preambleStart : heading.contentStart;
}

export function parseChavrutaDocument(html: string): ChavrutaAmud[] {
  const headings: Array<{
    dafNum: number;
    amud: Amud;
    titleHe: string;
    matchIndex: number;
    contentStart: number;
  }> = [];
  const pattern = new RegExp(DAF_HEADING_PATTERN.source, DAF_HEADING_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const dafNum = gematriaToNumber(match[1]);
    if (dafNum <= 0) continue;

    headings.push({
      dafNum,
      amud: match[2] === 'ב' ? 'b' : 'a',
      titleHe: `דף ${match[1].trim()} - ${match[2]}`,
      matchIndex: match.index,
      contentStart: match.index + match[0].length,
    });
  }

  type GroupedAmud = {
    dafNum: number;
    amud: Amud;
    titleHe: string;
    sections: ParsedSection[];
  };

  const order: string[] = [];
  const grouped = new Map<string, GroupedAmud>();
  let pendingStarts: PendingBoundaryBlock[] = [];

  const prependPending = (blocks: ChavrutaBlock[]): ChavrutaBlock[] => {
    if (pendingStarts.length === 0) return blocks;
    const leading = pendingStarts;
    pendingStarts = [];
    return [...leading, ...blocks];
  };

  headings.forEach((heading, index) => {
    const sectionEnd = index + 1 < headings.length ? headings[index + 1].matchIndex : html.length;
    const sectionStart = index === 0 ? firstSectionStart(html, heading) : heading.contentStart;
    const parsed = parseSectionWithBoundaries(html.slice(sectionStart, sectionEnd));
    if (parsed.blocks.length === 0 && parsed.footnotes.length === 0) return;

    const key = buildAmudKey(heading.dafNum, heading.amud);
    const existing = grouped.get(key);

    if (existing) {
      existing.sections.push({
        ...parsed,
        blocks: parsed.blocks,
      });
      return;
    }

    order.push(key);
    grouped.set(key, {
      dafNum: heading.dafNum,
      amud: heading.amud,
      titleHe: heading.titleHe,
      sections: [{ ...parsed, blocks: prependPending(parsed.blocks) }],
    });
  });

  const finalized: ChavrutaAmud[] = [];

  order.forEach((key, index) => {
    const entry = grouped.get(key)!;
    const merged = mergeSections(entry.dafNum, entry.amud, entry.titleHe, entry.sections);
    const isLast = index === order.length - 1;
    if (isLast) {
      if (merged.blocks.length > 0 || merged.footnotes.length > 0) {
        finalized.push(merged);
      }
      return;
    }

    const peeled = peelTrailingChapterStarts(merged.blocks);
    pendingStarts = peeled.trailingStarts;
    const nextKey = order[index + 1];
    const nextEntry = grouped.get(nextKey);
    if (nextEntry && nextEntry.sections[0]) {
      nextEntry.sections[0] = {
        ...nextEntry.sections[0],
        blocks: prependPending(nextEntry.sections[0].blocks),
      };
    }

    if (peeled.blocks.length > 0 || merged.footnotes.length > 0) {
      finalized.push({
        ...merged,
        blocks: peeled.blocks,
        paragraphs: paragraphsFromBlocks(peeled.blocks),
      });
    }
  });

  return finalized;
}

export function findChavrutaAmud(
  amudim: ChavrutaAmud[],
  dafNum: number,
  amud: Amud
): ChavrutaAmud | null {
  return amudim.find((item) => item.dafNum === dafNum && item.amud === amud) ?? null;
}

function parseGemaraRuns(text: string): Array<{ text: string; isGemara: boolean }> {
  if (!text) return [];

  return text
    .split(/(\*\*[\s\S]+?\*\*)/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return { text: part.slice(2, -2), isGemara: true };
      }
      return { text: part, isGemara: false };
    })
    .filter((run) => run.text.length > 0);
}

export function parseChavrutaBodyParts(text: string): ChavrutaBodyPart[] {
  if (!text) return [];

  const parts: ChavrutaBodyPart[] = [];
  const pattern = new RegExp(FOOTNOTE_TOKEN_PATTERN.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      for (const run of parseGemaraRuns(text.slice(lastIndex, match.index))) {
        parts.push({ kind: 'text', text: run.text, isGemara: run.isGemara });
      }
    }

    const id = Number(match[1]);
    if (Number.isFinite(id) && id > 0) {
      parts.push({ kind: 'footnote', id });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    for (const run of parseGemaraRuns(text.slice(lastIndex))) {
      parts.push({ kind: 'text', text: run.text, isGemara: run.isGemara });
    }
  }

  return parts;
}
