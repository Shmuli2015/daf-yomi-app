const IGNORABLE_MARK_CHARS = '\\u0591-\\u05C7\\u05F3\\u05F4\'"';
const IGNORABLE_MARKS_PATTERN = new RegExp(`[${IGNORABLE_MARK_CHARS}]`, 'g');
const OPTIONAL_MARKS_PATTERN = `[${IGNORABLE_MARK_CHARS}]*`;
const HEBREW_PREFIXES = ['וכש', 'כש', 'וה', 'וב', 'ול', 'ומ', 'ה', 'ב', 'ל', 'מ', 'ש', 'ו', 'כ'];
const MIN_STEM_LENGTH = 3;
const MIN_TOKEN_LENGTH = 2;

export function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(IGNORABLE_MARKS_PATTERN, '');
}

export function stripHebrewPrefix(token: string): string {
  const prefix = HEBREW_PREFIXES.find(
    (candidate) =>
      token.startsWith(candidate) && token.length - candidate.length >= MIN_STEM_LENGTH,
  );
  return prefix ? token.slice(prefix.length) : token;
}

export function tokenizeQuery(query: string): string[] {
  const tokens = normalizeForSearch(query)
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);
  return Array.from(new Set(tokens));
}

function getTokenVariants(token: string): string[] {
  const stem = stripHebrewPrefix(token);
  return stem === token ? [token] : [token, stem];
}

export function matchesAllTokens(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const normalizedText = normalizeForSearch(text);
  return tokens.every((token) =>
    getTokenVariants(token).some((variant) => normalizedText.includes(variant)),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toMarkTolerantPattern(variant: string): string {
  return Array.from(variant).map(escapeRegExp).join(OPTIONAL_MARKS_PATTERN);
}

export function buildHighlightRegex(tokens: string[]): RegExp | null {
  if (tokens.length === 0) return null;
  const variants = Array.from(new Set(tokens.flatMap(getTokenVariants))).sort(
    (first, second) => second.length - first.length,
  );
  return new RegExp(`(${variants.map(toMarkTolerantPattern).join('|')})`, 'gi');
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export function splitByHighlight(text: string, highlightRegex: RegExp | null): HighlightSegment[] {
  if (!highlightRegex) return [{ text, isMatch: false }];
  return text
    .split(highlightRegex)
    .map((segment, index) => ({ text: segment, isMatch: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}
