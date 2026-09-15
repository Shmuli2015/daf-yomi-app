export type Amud = 'a' | 'b';

export interface MishnahDafRange {
  dafNum: number;
  amud: Amud;
  range: string;
}

export const KINNIM_SEFARIA_BOOK = 'Mishnah_Kinnim';
export const MIDDOT_SEFARIA_BOOK = 'Mishnah_Middot';

export const KINNIM_CHAPTER_NAMES = [
  'חטאת העוף',
  'קן סתומה',
  'במה דברים אמורים',
] as const;

export const MIDDOT_CHAPTER_NAMES = [
  'בשלושה מקומות',
  'הר הבית',
  'המזבח',
  'פתח ההיכל',
  'לשכות',
] as const;

export const KINNIM_CHAPTER_MISHNAH_COUNTS = [4, 5, 6] as const;

export const MIDDOT_CHAPTER_MISHNAH_COUNTS = [9, 6, 8, 7, 4] as const;

export const KINNIM_DAF_RANGES: readonly MishnahDafRange[] = [
  { dafNum: 23, amud: 'a', range: '1.1-2' },
  { dafNum: 23, amud: 'b', range: '1.3-4' },
  { dafNum: 24, amud: 'a', range: '2.1-3' },
  { dafNum: 24, amud: 'b', range: '2.4-5' },
  { dafNum: 25, amud: 'a', range: '3.1-6' },
];

export const MIDDOT_DAF_RANGES: readonly MishnahDafRange[] = [
  { dafNum: 34, amud: 'a', range: '1.1-5' },
  { dafNum: 34, amud: 'b', range: '1.6-9' },
  { dafNum: 35, amud: 'a', range: '2.1-3' },
  { dafNum: 35, amud: 'b', range: '2.4-6' },
  { dafNum: 36, amud: 'a', range: '3.1-4' },
  { dafNum: 36, amud: 'b', range: '3.5-8' },
  { dafNum: 37, amud: 'a', range: '4.1-4' },
  { dafNum: 37, amud: 'b', range: '4.5-5.4' },
];
