import { parseCommentaryRuns } from './commentaryEmphasis';

const FOOTNOTE_DASH_RE = /\s+([–−-])\s+/;
const MAX_FOOTNOTE_DASH_DIBUR_LENGTH = 40;

const SOURCE_BASE_NAMES = [
  'קרבן העדה',
  'שיירי קרבן',
  'תוספות יום טוב',
  'דרך אמונה',
  'שפת אמת',
  'פני משה',
  'רבינו יונה',
  'תוספתא',
  'תוספות',
  'ירושלמי',
  'בבלי',
  "תוס'",
  'ריטב"א',
  'מהרש"א',
  'רשב"א',
  'רמב"ם',
  'רמב"ן',
  'רידב"ז',
  'צל"ח',
  'רא"ש',
  'גר"א',
  'רש"י',
  'ר"ן',
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nameVariants(name: string): string[] {
  const variants = [name, `ו${name}`];
  if (!name.startsWith('ה') && !name.startsWith('ו')) {
    variants.push(`ה${name}`, `וה${name}`);
  }
  return variants;
}

function quoteInsensitivePattern(name: string): string {
  return escapeRegExp(name)
    .replace(/["״]/g, '["״]')
    .replace(/['׳]/g, "['׳]");
}

const SOURCE_NAME_PATTERN = new RegExp(
  `(?<![\\u05D0-\\u05EA])(?:${[...new Set(SOURCE_BASE_NAMES.flatMap(nameVariants))]
    .sort((a, b) => b.length - a.length)
    .map(quoteInsensitivePattern)
    .join('|')})(?![\\u05D0-\\u05EA])`,
  'g',
);

const QUOTE_PATTERN =
  /(?<![\u05D0-\u05EA])(["״])([\u05D0-\u05EA][\u05D0-\u05EA\s.,;:־–—]{3,78}[\u05D0-\u05EA])\1(?![\u05D0-\u05EA])/g;

function wrapIfBare(match: string, offset: number, full: string): string {
  const before = full.slice(Math.max(0, offset - 2), offset);
  const after = full.slice(offset + match.length, offset + match.length + 2);
  if (before.endsWith('**') || after.startsWith('**')) {
    return match;
  }
  return `**${match}**`;
}

function emphasizeSourcesAndQuotes(text: string): string {
  const withQuotes = text.replace(QUOTE_PATTERN, (full, quote: string, inner: string) => {
    if (inner.includes('**')) return full;
    return `${quote}**${inner}**${quote}`;
  });

  return withQuotes.replace(SOURCE_NAME_PATTERN, (match, offset, full) =>
    wrapIfBare(match, offset, full),
  );
}

function emphasizeFootnoteDashDibur(text: string): string {
  if (!text || text.includes('**')) return text;

  const dashMatch = text.match(FOOTNOTE_DASH_RE);
  const dashIndex = dashMatch?.index ?? -1;
  if (!dashMatch || dashIndex <= 0) return text;

  const dibur = text.slice(0, dashIndex).trim();
  if (!dibur || dibur.length > MAX_FOOTNOTE_DASH_DIBUR_LENGTH) return text;

  const rest = text.slice(dashIndex + dashMatch[0].length).trim();
  return rest ? `**${dibur}** ${dashMatch[1]} ${rest}` : `**${dibur}**`;
}

function emphasizePlainFootnoteRun(text: string): string {
  const withDibur = /[\u05D0-\u05EA]/.test(text) ? emphasizeFootnoteDashDibur(text) : text;
  return parseCommentaryRuns(withDibur)
    .map((run) => (run.isGemara ? `**${run.text}**` : emphasizeSourcesAndQuotes(run.text)))
    .join('');
}

export function emphasizeChavrutaFootnote(text: string): string {
  if (!text) return '';

  return parseCommentaryRuns(text)
    .map((run) => (run.isGemara ? `**${run.text}**` : emphasizePlainFootnoteRun(run.text)))
    .join('');
}
