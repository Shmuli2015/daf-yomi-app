export type SearchableSetting = {
  title: string;
  description?: string;
  synonyms?: string[];
};

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\"״׳']/g, '');
}

export function matchesSetting(query: string, item: SearchableSetting): boolean {
  if (!query.trim()) return true;
  const needle = normalizeSearchText(query);
  if (!needle) return true;
  const haystack = [item.title, item.description ?? '', ...(item.synonyms ?? [])]
    .map(normalizeSearchText)
    .join(' ');
  return haystack.includes(needle);
}

export function matchesAnySetting(query: string, items: SearchableSetting[]): boolean {
  if (!query.trim()) return true;
  return items.some(item => matchesSetting(query, item));
}

export function isLastVisible(flags: boolean[], index: number): boolean {
  return flags.lastIndexOf(true) === index;
}
