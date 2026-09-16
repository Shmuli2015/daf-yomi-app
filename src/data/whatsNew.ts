export const APP_NOTES_END_MARKER = '<!-- app-notes-end -->';
export const MAX_WHATS_NEW_HIGHLIGHTS = 8;

export type WhatsNewEntry = {
  version: string;
  highlights: string[];
};

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    version: '1.1.2',
    highlights: [
      'רואים מה השתנה לפני הורדת העדכון',
      'חלון מה חדש אחרי ההתקנה',
      'אפשר לפתוח שוב מההגדרות',
      'תיקון יישור בקריאת הגמרא',
    ],
  },
];

export function normalizeWhatsNewVersion(raw: string): string {
  return raw.trim().replace(/^v/i, '');
}

export function getHighlightsFromEntries(entries: WhatsNewEntry[], version: string): string[] {
  const normalized = normalizeWhatsNewVersion(version);
  const entry = entries.find(item => item.version === normalized);
  if (!entry) return [];
  return entry.highlights.map(item => item.trim()).filter(Boolean).slice(0, MAX_WHATS_NEW_HIGHLIGHTS);
}

export function getHighlightsForVersion(version: string): string[] {
  return getHighlightsFromEntries(WHATS_NEW, version);
}

export function hasWhatsNewForVersion(version: string): boolean {
  return getHighlightsForVersion(version).length > 0;
}

export function shouldShowWhatsNewOnLaunch(
  seenVersion: string | null | undefined,
  installedVersion: string,
  entries: WhatsNewEntry[] = WHATS_NEW,
): boolean {
  if (!seenVersion) return false;
  if (normalizeWhatsNewVersion(seenVersion) === normalizeWhatsNewVersion(installedVersion)) {
    return false;
  }
  return getHighlightsFromEntries(entries, installedVersion).length > 0;
}

export function formatWhatsNewReleaseBodyFrom(highlights: string[]): string {
  const items = highlights.map(item => item.trim()).filter(Boolean).slice(0, MAX_WHATS_NEW_HIGHLIGHTS);
  if (!items.length) {
    return `${APP_NOTES_END_MARKER}\n`;
  }
  const bullets = items.map(item => `- ${item}`).join('\n');
  return `## מה חדש\n${bullets}\n\n${APP_NOTES_END_MARKER}\n`;
}

export function formatWhatsNewReleaseBody(version: string): string {
  return formatWhatsNewReleaseBodyFrom(getHighlightsForVersion(version));
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

export function parseReleaseNotesBody(body: string | null | undefined): string[] {
  if (!body) return [];
  const endIndex = body.indexOf(APP_NOTES_END_MARKER);
  const hasMarker = endIndex >= 0;
  const hasHebrewHeading = /##\s*מה חדש/.test(body);
  if (!hasMarker && !hasHebrewHeading) return [];
  const section = hasMarker ? body.slice(0, endIndex) : body;
  const items: string[] = [];
  for (const rawLine of section.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    if (/^#{1,6}\s/.test(trimmed)) continue;
    if (/^full changelog/i.test(trimmed)) break;
    const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
    if (!bullet) continue;
    const text = stripInlineMarkdown(bullet[1] ?? '');
    if (text) items.push(text);
    if (items.length >= MAX_WHATS_NEW_HIGHLIGHTS) break;
  }
  return items;
}
