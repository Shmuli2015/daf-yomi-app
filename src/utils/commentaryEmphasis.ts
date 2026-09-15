import type { SefariaCommentatorKey } from './sefariaCommentators';

export type CommentaryRun = {
  text: string;
  isGemara: boolean;
};

const RASHI_DASH_RE = /\s+([–—−-])\s+/;
const MAX_PERIOD_DIBUR_LENGTH = 100;
const HEBREW_NIKUD = '[\\u0591-\\u05C7]*';
const GERESH = '[\\u05F3\\u05F4\\u2019\']';

function heLetters(letters: string): string {
  return letters
    .split('')
    .map((letter) => `${letter}${HEBREW_NIKUD}`)
    .join('');
}

const INSERTED_MATNI_LABEL = 'מַתְנִי׳';

const MATNI_LABEL_RE = new RegExp(`(?<![\\u05D0-\\u05EA])${heLetters('מתני')}${GERESH}`);

const EXISTING_SECTION_HEADING_RE = new RegExp(
  `^(?:${heLetters('גמ')}${GERESH}|${heLetters('משנה')}\\s*:|${heLetters('הלכה')}\\s*:|${heLetters('הדרן')})`,
);

const GEMARA_SECTION_LABEL_RE = new RegExp(
  `(?<![\\u05D0-\\u05EA])(?:${heLetters('מתני')}${GERESH}|${heLetters('גמ')}${GERESH}|${heLetters('משנה')}\\s*:|${heLetters('הלכה')}\\s*:)`,
  'g',
);

function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '-')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '-')
    .replace(/&#x2013;/gi, '–')
    .replace(/&#x2014;/gi, '-')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function wrapBareLabel(match: string, offset: number, full: string): string {
  const before = full.slice(Math.max(0, offset - 2), offset);
  const after = full.slice(offset + match.length, offset + match.length + 2);
  if (before.endsWith('**') || after.startsWith('**')) {
    return match;
  }
  return `**${match}**`;
}

export function emphasizeGemaraSectionLabels(text: string): string {
  if (!text) return '';
  return text.replace(GEMARA_SECTION_LABEL_RE, wrapBareLabel);
}

function leadingEmphasisInner(html: string): string | null {
  const match = html.match(/^\s*<(big|strong)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/i);
  if (!match) return null;

  const nested = match[2].match(/<(big|strong)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/i);
  const inner = nested?.[2] ?? match[2];
  const text = stripHtmlToText(inner);
  return text || null;
}

function shouldInsertMatniLabel(html: string, stripped: string): boolean {
  if (MATNI_LABEL_RE.test(stripped)) return false;
  const inner = leadingEmphasisInner(html);
  if (!inner) return false;
  return !EXISTING_SECTION_HEADING_RE.test(inner);
}

export function cleanCommentaryHtml(html: string): string {
  if (!html) return '';

  const withMarkers = html.replace(
    /<(b|strong|big)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_match, _tag, inner: string) => {
      const stripped = String(inner).replace(/<[^>]+>/g, '');
      return stripped ? `**${stripped}**` : '';
    },
  );

  return stripHtmlToText(withMarkers);
}

export function prepareGemaraText(html: string): string {
  const source = html || '';
  const stripped = stripHtmlToText(source);
  const withMatni = shouldInsertMatniLabel(source, stripped)
    ? `${INSERTED_MATNI_LABEL} ${stripped}`
    : stripped;
  return emphasizeGemaraSectionLabels(withMatni);
}

export function emphasizeRashiDibur(text: string): string {
  if (!text) return text;

  return text
    .split('\n\n')
    .map((block) => emphasizeRashiDiburBlock(block))
    .join('\n\n');
}

function emphasizeRashiDiburBlock(block: string): string {
  if (!block || block.includes('**')) return block;

  const dashMatch = block.match(RASHI_DASH_RE);
  const dashIndex = dashMatch?.index ?? -1;
  const head = dashIndex >= 0 ? block.slice(0, dashIndex) : block;
  const periodMatch = head.match(/^([\s\S]*?\.)(?:\s+|$)/);
  const periodDibur = periodMatch?.[1]?.trim() ?? '';

  if (periodDibur && periodDibur.length <= MAX_PERIOD_DIBUR_LENGTH) {
    const rest = block.slice(periodMatch![0].length).trim();
    return rest ? `**${periodDibur}** ${rest}` : `**${periodDibur}**`;
  }

  if (dashMatch && dashIndex > 0) {
    const dibur = block.slice(0, dashIndex).trim();
    const rest = block.slice(dashIndex + dashMatch[0].length).trim();
    if (!dibur) return block;
    return rest ? `**${dibur}** ${dashMatch[1]} ${rest}` : `**${dibur}**`;
  }

  return block;
}

export function prepareCommentaryText(
  html: string,
  commentator: SefariaCommentatorKey,
): string {
  const cleaned = cleanCommentaryHtml(html);
  return commentator === 'steinsaltz' ? cleaned : emphasizeRashiDibur(cleaned);
}

export function parseCommentaryRuns(text: string): CommentaryRun[] {
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
