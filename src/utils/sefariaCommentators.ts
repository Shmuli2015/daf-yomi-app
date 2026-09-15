export type SefariaCommentatorKey =
  | 'rashi'
  | 'tosafot'
  | 'steinsaltz'
  | 'korbanHaEdah'
  | 'peneiMoshe'
  | 'ridbaz'
  | 'sheyareiKorban'
  | 'bartenura'
  | 'rambam'
  | 'mefaresh'
  | 'rosh';

export const CLASSIC_COMMENTATOR_KEYS: readonly SefariaCommentatorKey[] = ['rashi', 'tosafot'];

export const SHEKALIM_COMMENTATOR_KEYS: readonly SefariaCommentatorKey[] = [
  'korbanHaEdah',
  'peneiMoshe',
  'ridbaz',
  'sheyareiKorban',
];

export const MISHNAH_COMMENTATOR_KEYS: readonly SefariaCommentatorKey[] = ['bartenura', 'rambam'];

export const TAMID_COMMENTATOR_KEYS: readonly SefariaCommentatorKey[] = ['mefaresh', 'rosh'];

export const COMMENTATOR_TITLE_HE: Record<SefariaCommentatorKey, string> = {
  rashi: 'רש״י',
  tosafot: 'תוספות',
  steinsaltz: 'שטיינזלץ',
  korbanHaEdah: 'קרבן העדה',
  peneiMoshe: 'פני משה',
  ridbaz: 'רידב״ז',
  sheyareiKorban: 'שיירי קרבן',
  bartenura: 'ברטנורא',
  rambam: 'רמב״ם',
  mefaresh: 'המפרש',
  rosh: 'רא״ש',
};

function isTamidBavliTref(tref: string): boolean {
  return /^Tamid\.\d+[ab]$/.test(tref);
}

export function classicCommentatorKeysForTref(tref: string): readonly SefariaCommentatorKey[] {
  if (tref.includes('Jerusalem_Talmud_Shekalim')) {
    return SHEKALIM_COMMENTATOR_KEYS;
  }
  if (tref.includes('Mishnah_Kinnim') || tref.includes('Mishnah_Middot')) {
    return MISHNAH_COMMENTATOR_KEYS;
  }
  if (isTamidBavliTref(tref)) {
    return TAMID_COMMENTATOR_KEYS;
  }
  return CLASSIC_COMMENTATOR_KEYS;
}

export type CommentatorFetchMode = 'bavli' | 'flatten' | 'yerushalmi' | 'mishnah';

export interface CommentatorFetchSpec {
  key: SefariaCommentatorKey;
  prefix: string;
  titleHe: string;
  mode: CommentatorFetchMode;
}

export function commentatorFetchSpecs(tref: string, shekalim: boolean): CommentatorFetchSpec[] {
  if (shekalim) {
    return [
      {
        key: 'steinsaltz',
        prefix: `Steinsaltz_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.steinsaltz,
        mode: 'flatten',
      },
      {
        key: 'korbanHaEdah',
        prefix: `Korban_HaEdah_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.korbanHaEdah,
        mode: 'yerushalmi',
      },
      {
        key: 'peneiMoshe',
        prefix: `Penei_Moshe_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.peneiMoshe,
        mode: 'yerushalmi',
      },
      {
        key: 'ridbaz',
        prefix: `Chiddushei_Ridbaz_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.ridbaz,
        mode: 'yerushalmi',
      },
      {
        key: 'sheyareiKorban',
        prefix: `Sheyarei_Korban_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.sheyareiKorban,
        mode: 'yerushalmi',
      },
    ];
  }

  if (tref.includes('Mishnah_Kinnim') || tref.includes('Mishnah_Middot')) {
    return [
      {
        key: 'bartenura',
        prefix: `Bartenura_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.bartenura,
        mode: 'mishnah',
      },
      {
        key: 'rambam',
        prefix: `Rambam_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.rambam,
        mode: 'mishnah',
      },
    ];
  }

  if (isTamidBavliTref(tref)) {
    return [
      {
        key: 'mefaresh',
        prefix: `Mefaresh_on_${tref}.1-99`,
        titleHe: COMMENTATOR_TITLE_HE.mefaresh,
        mode: 'bavli',
      },
      {
        key: 'steinsaltz',
        prefix: `Steinsaltz_on_${tref}`,
        titleHe: COMMENTATOR_TITLE_HE.steinsaltz,
        mode: 'bavli',
      },
    ];
  }

  return [
    { key: 'rashi', prefix: `Rashi_on_${tref}`, titleHe: COMMENTATOR_TITLE_HE.rashi, mode: 'bavli' },
    {
      key: 'tosafot',
      prefix: `Tosafot_on_${tref}`,
      titleHe: COMMENTATOR_TITLE_HE.tosafot,
      mode: 'bavli',
    },
    {
      key: 'steinsaltz',
      prefix: `Steinsaltz_on_${tref}`,
      titleHe: COMMENTATOR_TITLE_HE.steinsaltz,
      mode: 'bavli',
    },
  ];
}

function normalizeHeQuotes(value: string): string {
  return value.replace(/[״”]/g, '"').replace(/[׳’]/g, "'").trim();
}

export function identifySefariaCommentator(item: {
  collectiveTitle?: { en?: string; he?: string };
  commentator?: string;
  heTitle?: string;
}): SefariaCommentatorKey | null {
  const en = (item.collectiveTitle?.en || item.commentator || '').toLowerCase().trim();
  const he = normalizeHeQuotes(item.collectiveTitle?.he || item.heTitle || '');

  if (en === 'rashi' || he === 'רש"י') {
    return 'rashi';
  }

  if (en === 'tosafot' || en === 'tosafos' || he === 'תוספות') {
    return 'tosafot';
  }

  if (en === 'steinsaltz' || he.includes('שטיינזלץ')) {
    return 'steinsaltz';
  }

  if (en === 'korban haedah' || he.includes('קרבן העדה')) {
    return 'korbanHaEdah';
  }

  if (en === 'penei moshe' || he.includes('פני משה')) {
    return 'peneiMoshe';
  }

  if (
    en === 'ridbaz' ||
    en === 'chiddushei ridbaz' ||
    he.includes('רידב"ז') ||
    he.includes('רידב״ז')
  ) {
    return 'ridbaz';
  }

  if (en === 'sheyarei korban' || he.includes('שיירי קרבן')) {
    return 'sheyareiKorban';
  }

  if (
    en === 'bartenura' ||
    en.includes('bartenura') ||
    en.includes('bertinoro') ||
    he.includes('ברטנורא')
  ) {
    return 'bartenura';
  }

  if (en === 'mefaresh' || he === 'מפרש' || he === 'המפרש' || he.startsWith('מפרש על')) {
    return 'mefaresh';
  }

  if (
    en === 'commentary of the rosh' ||
    en.startsWith('commentary of the rosh') ||
    he === 'פירוש הרא"ש' ||
    he.startsWith('פירוש הרא"ש')
  ) {
    return 'rosh';
  }

  if (en === 'rambam' || he === 'רמב"ם' || he === 'רמב״ם') {
    return 'rambam';
  }

  return null;
}

export function filterCommentaries<T extends { commentator: SefariaCommentatorKey }>(
  commentaries: Record<number, T[] | undefined>,
  keys: readonly SefariaCommentatorKey[],
): Record<number, T[]> {
  const allowed = new Set(keys);
  const result: Record<number, T[]> = {};

  for (const [rawIndex, items] of Object.entries(commentaries)) {
    if (!items) continue;
    const filtered = items.filter((item) => allowed.has(item.commentator));
    if (filtered.length > 0) {
      result[Number(rawIndex)] = filtered;
    }
  }

  return result;
}

export function collectCommentariesWithIndex<T extends { commentator: SefariaCommentatorKey; he: string }>(
  commentaries: Record<number, T[] | undefined>,
  key: SefariaCommentatorKey,
): Array<{ index: number; item: T }> {
  return Object.entries(commentaries)
    .map(([index, items]) => ({
      index: Number(index),
      item: items?.find((entry) => entry.commentator === key),
    }))
    .filter((entry): entry is { index: number; item: T } => Boolean(entry.item?.he))
    .sort((a, b) => a.index - b.index);
}

export function collectCommentariesByKey<T extends { commentator: SefariaCommentatorKey; he: string }>(
  commentaries: Record<number, T[] | undefined>,
  key: SefariaCommentatorKey,
): T[] {
  return collectCommentariesWithIndex(commentaries, key).map((entry) => entry.item);
}
