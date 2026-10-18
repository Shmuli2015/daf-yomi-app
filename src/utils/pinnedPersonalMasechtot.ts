export const MAX_PINNED_PERSONAL_MASECHTOT = 12;

export function parsePinnedPersonalMasechtot(
  pinnedJson: string | null | undefined,
  legacyActiveMasechet?: string | null,
): string[] {
  if (typeof pinnedJson === 'string' && pinnedJson.length > 0) {
    try {
      const parsed: unknown = JSON.parse(pinnedJson);
      if (Array.isArray(parsed)) {
        return dedupePinned(parsed);
      }
    } catch {
      return dedupePinned([legacyActiveMasechet]);
    }
  }
  return dedupePinned([legacyActiveMasechet]);
}

function dedupePinned(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 100 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= MAX_PINNED_PERSONAL_MASECHTOT) break;
  }
  return result;
}

export function serializePinnedPersonalMasechtot(masechtot: string[]): string {
  return JSON.stringify(dedupePinned(masechtot));
}

export function addPinnedPersonalMasechet(current: string[], masechetEn: string): string[] {
  return dedupePinned([...current, masechetEn]);
}

export function removePinnedPersonalMasechet(current: string[], masechetEn: string): string[] {
  return current.filter(item => item !== masechetEn);
}
