const NIKUD_RE = /[\u0591-\u05C7]/g;
const HEBREW_WORD_RE = /[\u05D0-\u05EA][\u05D0-\u05EA\u0591-\u05C7\u05F3\u05F4']*/g;
const MIN_MATCH_WORDS = 3;

type WordSpan = {
  start: number;
  end: number;
  norm: string;
};

export function normalizeHebrewMatchToken(raw: string): string {
  if (!raw) return '';
  const stripped = raw.replace(NIKUD_RE, '').replace(/[^\u05D0-\u05EA\u05F3\u05F4']/g, '');
  if (/^ר[\u05F3\u05F4']$/.test(stripped)) {
    return 'רבי';
  }
  return stripped.replace(/[\u05F3\u05F4']/g, '');
}

function tokenizeHebrewWords(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  HEBREW_WORD_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HEBREW_WORD_RE.exec(text))) {
    const norm = normalizeHebrewMatchToken(match[0]);
    if (!norm) continue;
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      norm,
    });
  }
  return spans;
}

function protectedRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const pattern of [/\[[^\]]*\]/g, /\([^)]*\)/g]) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }
  return ranges;
}

function isProtected(index: number, ranges: ReadonlyArray<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end);
}

export function buildGemaraMatchCorpus(gemaraTexts: ReadonlyArray<string>): string {
  const words: string[] = [];
  for (const text of gemaraTexts) {
    if (!text) continue;
    for (const span of tokenizeHebrewWords(text)) {
      words.push(span.norm);
    }
  }
  if (words.length === 0) return '';
  return ` ${words.join(' ')} `;
}

function findMatchRanges(text: string, corpus: string): Array<[number, number]> {
  if (!text || !corpus) return [];

  const protectedZones = protectedRanges(text);
  const words = tokenizeHebrewWords(text).filter((word) => !isProtected(word.start, protectedZones));
  if (words.length < MIN_MATCH_WORDS) return [];

  const ranges: Array<[number, number]> = [];
  let index = 0;
  while (index < words.length) {
    let matchedLength = 0;
    const maxLength = words.length - index;
    for (let length = maxLength; length >= MIN_MATCH_WORDS; length -= 1) {
      const phrase = words
        .slice(index, index + length)
        .map((word) => word.norm)
        .join(' ');
      if (corpus.includes(` ${phrase} `)) {
        matchedLength = length;
        break;
      }
    }

    if (matchedLength > 0) {
      const start = words[index].start;
      const end = words[index + matchedLength - 1].end;
      ranges.push([start, end]);
      index += matchedLength;
      continue;
    }

    index += 1;
  }

  return ranges;
}

function emphasizePlainAgainstGemara(text: string, corpus: string): string {
  const ranges = findMatchRanges(text, corpus);
  if (ranges.length === 0) return text;

  let result = text;
  for (let i = ranges.length - 1; i >= 0; i -= 1) {
    const [start, end] = ranges[i];
    const slice = result.slice(start, end);
    if (slice.startsWith('**') && slice.endsWith('**')) continue;
    result = `${result.slice(0, start)}**${slice}**${result.slice(end)}`;
  }
  return result;
}

export function emphasizeSteinsaltzFromGemara(
  steinsaltzText: string,
  gemaraTexts: ReadonlyArray<string>,
): string {
  if (!steinsaltzText || gemaraTexts.length === 0) return steinsaltzText || '';

  const corpus = buildGemaraMatchCorpus(gemaraTexts);
  if (!corpus.trim()) return steinsaltzText;

  return steinsaltzText
    .split(/(\*\*[\s\S]+?\*\*)/g)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return part;
      }
      return emphasizePlainAgainstGemara(part, corpus);
    })
    .join('');
}
