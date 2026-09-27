export const APP_NOTES_END_MARKER = '<!-- app-notes-end -->';
export const MAX_WHATS_NEW_HIGHLIGHTS = 8;

export type WhatsNewEntry = {
  version: string;
  highlights: string[];
};

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    version: '1.1.7',
    highlights: [
      'ערכות צבע לקריאה: בהיר, ספיה (דף ישן) וכהה',
      'כיבוי והדלקת ניקוד בגמרא מהקורא ומההגדרות',
      'כותרות מתני׳ וגמרא במצב חברותא',
      'מתג מסך דלוק בהגדרות בזמן קריאה',
    ],
  },
  {
    version: '1.1.6',
    highlights: [
      'לחיצה ארוכה על מסכת לסימון או ביטול של כל הדפים',
      'סימון מסכת שלמה גם במסלול האישי',
      'גיבוי ושחזור כוללים את המסלול האישי והמסכת הפעילה',
    ],
  },

  {
    version: '1.1.5',
    highlights: [
      'הגדרת מתי מתחיל יום הדף היומי',
      'חיפוש בהגדרות ובמדריך',
      'רמז החלקה מחודש במסך הבית',
      'הדגשה וצבעים ברורים יותר לדף בלוח השנה',
      'פעולות בהתראת לימוד נסגרות בלי לפתוח את האפליקציה',
      'שיפורי ביצועים והקטנת גודל האפליקציה',
    ],
  },
  {
    version: '1.1.4',
    highlights: [
      'המסך לא נכבה בזמן קריאת הגמרא',
      'תיקון כפתורי דחייה וביטול בהתראות',
    ],
  },
  {
    version: '1.1.3',
    highlights: [
      'פירושי רש״י ותוספות נפתחים מתחת לקטע בגמרא',
      'פס התקדמות בקריאה וכפתור חזרה לראש הדף',
      'מסך בית מחודש עם תזכורת להשלים פיגור',
      'מדריך ושאלות נפוצות בהגדרות',
      'חצי דף מסומן בבירור בלוח השנה',
      'השלמת פערים בלוח השנה',
      'העדפות קריאה ותזכורת גיבוי בהגדרות',
    ],
  },
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

function compareWhatsNewVersions(a: string, b: string): number {
  const parse = (raw: string): [number, number, number] => {
    const core = normalizeWhatsNewVersion(raw).split('-')[0] ?? '';
    const parts = core.split('.').map(part => parseInt(part, 10));
    return [
      Number.isFinite(parts[0]) ? parts[0] : 0,
      Number.isFinite(parts[1]) ? parts[1] : 0,
      Number.isFinite(parts[2]) ? parts[2] : 0,
    ];
  };
  const [a1, a2, a3] = parse(a);
  const [b1, b2, b3] = parse(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

function collectUniqueHighlights(entries: WhatsNewEntry[]): string[] {
  const sorted = [...entries].sort((left, right) =>
    compareWhatsNewVersions(right.version, left.version),
  );
  const items: string[] = [];
  const seen = new Set<string>();
  for (const entry of sorted) {
    for (const highlight of entry.highlights.map(item => item.trim()).filter(Boolean)) {
      if (seen.has(highlight)) continue;
      seen.add(highlight);
      items.push(highlight);
      if (items.length >= MAX_WHATS_NEW_HIGHLIGHTS) return items;
    }
  }
  return items;
}

export function getHighlightsSinceFromEntries(
  entries: WhatsNewEntry[],
  seenVersion: string | null | undefined,
  installedVersion: string,
): string[] {
  if (
    seenVersion &&
    normalizeWhatsNewVersion(seenVersion) === normalizeWhatsNewVersion(installedVersion)
  ) {
    return [];
  }
  if (!seenVersion) {
    return getHighlightsFromEntries(entries, installedVersion);
  }
  const inRange = entries.filter(entry => {
    const afterSeen = compareWhatsNewVersions(entry.version, seenVersion) > 0;
    const upToInstalled = compareWhatsNewVersions(entry.version, installedVersion) <= 0;
    return afterSeen && upToInstalled;
  });
  return collectUniqueHighlights(inRange);
}

export function getHighlightsSince(
  seenVersion: string | null | undefined,
  installedVersion: string,
): string[] {
  return getHighlightsSinceFromEntries(WHATS_NEW, seenVersion, installedVersion);
}

export function getAllReleaseHighlightsFromEntries(entries: WhatsNewEntry[]): string[] {
  return collectUniqueHighlights(entries);
}

export function getKnownHighlightsUpToVersionFromEntries(
  entries: WhatsNewEntry[],
  installedVersion: string,
): string[] {
  const upToInstalled = entries.filter(
    entry => compareWhatsNewVersions(entry.version, installedVersion) <= 0,
  );
  return collectUniqueHighlights(upToInstalled);
}

export function getKnownHighlightsUpToVersion(installedVersion: string): string[] {
  return getKnownHighlightsUpToVersionFromEntries(WHATS_NEW, installedVersion);
}

export function filterReleaseHighlightsForUpdateFromEntries(
  remoteHighlights: string[],
  entries: WhatsNewEntry[],
  installedVersion: string,
): string[] {
  const known = new Set(getKnownHighlightsUpToVersionFromEntries(entries, installedVersion));
  const filtered: string[] = [];
  for (const item of remoteHighlights.map(text => text.trim()).filter(Boolean)) {
    if (known.has(item)) continue;
    filtered.push(item);
    if (filtered.length >= MAX_WHATS_NEW_HIGHLIGHTS) break;
  }
  return filtered;
}

export function filterReleaseHighlightsForUpdate(
  remoteHighlights: string[],
  installedVersion: string,
): string[] {
  return filterReleaseHighlightsForUpdateFromEntries(remoteHighlights, WHATS_NEW, installedVersion);
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
  if (
    seenVersion &&
    normalizeWhatsNewVersion(seenVersion) === normalizeWhatsNewVersion(installedVersion)
  ) {
    return false;
  }
  return getHighlightsSinceFromEntries(entries, seenVersion, installedVersion).length > 0;
}

export function formatWhatsNewReleaseBodyFrom(highlights: string[]): string {
  const items = highlights.map(item => item.trim()).filter(Boolean).slice(0, MAX_WHATS_NEW_HIGHLIGHTS);
  if (!items.length) {
    return `${APP_NOTES_END_MARKER}\n`;
  }
  const bullets = items.map(item => `- ${item}`).join('\n');
  return `## מה חדש\n${bullets}\n\n${APP_NOTES_END_MARKER}\n`;
}

export function formatWhatsNewReleaseBody(_version?: string): string {
  return formatWhatsNewReleaseBodyFrom(getAllReleaseHighlightsFromEntries(WHATS_NEW));
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
