export interface ChavrutaSource {
  masechetEn: string;
  fileId: string;
}

export const CHAVRUTA_BASE_URL = 'https://www.toratemetfreeware.com/online/';

export const CHAVRUTA_SOURCES: ChavrutaSource[] = [
  { masechetEn: 'Berachot', fileId: 'f_02337' },
  { masechetEn: 'Shabbat', fileId: 'f_02338' },
  { masechetEn: 'Eruvin', fileId: 'f_02339' },
  { masechetEn: 'Pesachim', fileId: 'f_02340' },
  { masechetEn: 'Shekalim', fileId: 'f_02341' },
  { masechetEn: 'Yoma', fileId: 'f_02343' },
  { masechetEn: 'Sukkah', fileId: 'f_02344' },
  { masechetEn: 'Beitzah', fileId: 'f_02345' },
  { masechetEn: 'Rosh Hashana', fileId: 'f_02342' },
  { masechetEn: 'Taanit', fileId: 'f_02346' },
  { masechetEn: 'Megillah', fileId: 'f_02347' },
  { masechetEn: 'Moed Katan', fileId: 'f_02348' },
  { masechetEn: 'Chagigah', fileId: 'f_02349' },
  { masechetEn: 'Yevamot', fileId: 'f_02350' },
  { masechetEn: 'Ketubot', fileId: 'f_02351' },
  { masechetEn: 'Nedarim', fileId: 'f_02352' },
  { masechetEn: 'Nazir', fileId: 'f_02353' },
  { masechetEn: 'Sotah', fileId: 'f_02354' },
  { masechetEn: 'Gitin', fileId: 'f_02355' },
  { masechetEn: 'Kiddushin', fileId: 'f_02356' },
  { masechetEn: 'Baba Kamma', fileId: 'f_02357' },
  { masechetEn: 'Baba Metzia', fileId: 'f_02358' },
  { masechetEn: 'Baba Batra', fileId: 'f_02359' },
  { masechetEn: 'Sanhedrin', fileId: 'f_02360' },
  { masechetEn: 'Makkot', fileId: 'f_02361' },
  { masechetEn: 'Shevuot', fileId: 'f_02362' },
  { masechetEn: 'Avodah Zarah', fileId: 'f_02363' },
  { masechetEn: 'Horayot', fileId: 'f_02364' },
  { masechetEn: 'Zevachim', fileId: 'f_02366' },
  { masechetEn: 'Menachot', fileId: 'f_02367' },
  { masechetEn: 'Chullin', fileId: 'f_02368' },
  { masechetEn: 'Bechorot', fileId: 'f_02369' },
  { masechetEn: 'Arachin', fileId: 'f_02370' },
  { masechetEn: 'Temurah', fileId: 'f_02371' },
  { masechetEn: 'Keritot', fileId: 'f_02372' },
  { masechetEn: 'Meilah', fileId: 'f_02373' },
  { masechetEn: 'Tamid', fileId: 'f_02374' },
  { masechetEn: 'Niddah', fileId: 'f_02375' },
];

const sourcesByMasechet = new Map<string, ChavrutaSource>(
  CHAVRUTA_SOURCES.map((source) => [source.masechetEn, source])
);

export function getChavrutaSource(masechetEn: string): ChavrutaSource | null {
  return sourcesByMasechet.get(masechetEn) ?? null;
}

export function hasChavrutaSource(masechetEn: string): boolean {
  return sourcesByMasechet.has(masechetEn);
}

export function buildChavrutaUrl(source: ChavrutaSource): string {
  return `${CHAVRUTA_BASE_URL}${source.fileId}.html`;
}
