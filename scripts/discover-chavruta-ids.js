const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.toratemetfreeware.com/online/';
const BAVLI_INDEX = 'd_root__030_bavli.html';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'chavrutaSources.ts');

const SHAS_MASECHTOT = [
  { en: 'Berachot', he: 'ברכות' },
  { en: 'Shabbat', he: 'שבת' },
  { en: 'Eruvin', he: 'עירובין' },
  { en: 'Pesachim', he: 'פסחים' },
  { en: 'Shekalim', he: 'שקלים' },
  { en: 'Yoma', he: 'יומא' },
  { en: 'Sukkah', he: 'סוכה' },
  { en: 'Beitzah', he: 'ביצה' },
  { en: 'Rosh Hashana', he: 'ראש השנה' },
  { en: 'Taanit', he: 'תענית' },
  { en: 'Megillah', he: 'מגילה' },
  { en: 'Moed Katan', he: 'מועד קטן' },
  { en: 'Chagigah', he: 'חגיגה' },
  { en: 'Yevamot', he: 'יבמות' },
  { en: 'Ketubot', he: 'כתובות' },
  { en: 'Nedarim', he: 'נדרים' },
  { en: 'Nazir', he: 'נזיר' },
  { en: 'Sotah', he: 'סוטה' },
  { en: 'Gitin', he: 'גיטין' },
  { en: 'Kiddushin', he: 'קידושין' },
  { en: 'Baba Kamma', he: 'בבא קמא' },
  { en: 'Baba Metzia', he: 'בבא מציעא' },
  { en: 'Baba Batra', he: 'בבא בתרא' },
  { en: 'Sanhedrin', he: 'סנהדרין' },
  { en: 'Makkot', he: 'מכות' },
  { en: 'Shevuot', he: 'שבועות' },
  { en: 'Avodah Zarah', he: 'עבודה זרה' },
  { en: 'Horayot', he: 'הוריות' },
  { en: 'Zevachim', he: 'זבחים' },
  { en: 'Menachot', he: 'מנחות' },
  { en: 'Chullin', he: 'חולין' },
  { en: 'Bechorot', he: 'בכורות' },
  { en: 'Arachin', he: 'ערכין' },
  { en: 'Temurah', he: 'תמורה' },
  { en: 'Keritot', he: 'כריתות' },
  { en: 'Meilah', he: 'מעילה' },
  { en: 'Kinnim', he: 'קינים' },
  { en: 'Tamid', he: 'תמיד' },
  { en: 'Midot', he: 'מדות' },
  { en: 'Niddah', he: 'נדה' },
];

const HE_ALIASES = {
  'ברכות': 'Berachot',
  'שבת': 'Shabbat',
  'עירובין': 'Eruvin',
  'ערובין': 'Eruvin',
  'פסחים': 'Pesachim',
  'שקלים': 'Shekalim',
  'יומא': 'Yoma',
  'סוכה': 'Sukkah',
  'סוכות': 'Sukkah',
  'ביצה': 'Beitzah',
  'ראש השנה': 'Rosh Hashana',
  'תענית': 'Taanit',
  'מגילה': 'Megillah',
  'מועד קטן': 'Moed Katan',
  'חגיגה': 'Chagigah',
  'יבמות': 'Yevamot',
  'כתובות': 'Ketubot',
  'נדרים': 'Nedarim',
  'נזיר': 'Nazir',
  'סוטה': 'Sotah',
  'גיטין': 'Gitin',
  'גטין': 'Gitin',
  'קידושין': 'Kiddushin',
  'קדושין': 'Kiddushin',
  'בבא קמא': 'Baba Kamma',
  'בבא מציעא': 'Baba Metzia',
  'בבא בתרא': 'Baba Batra',
  'סנהדרין': 'Sanhedrin',
  'מכות': 'Makkot',
  'שבועות': 'Shevuot',
  'עבודה זרה': 'Avodah Zarah',
  'עבודה זרה': 'Avodah Zarah',
  'הוריות': 'Horayot',
  'זבחים': 'Zevachim',
  'מנחות': 'Menachot',
  'חולין': 'Chullin',
  'בכורות': 'Bechorot',
  'ערכין': 'Arachin',
  'תמורה': 'Temurah',
  'כריתות': 'Keritot',
  'מעילה': 'Meilah',
  'קינים': 'Kinnim',
  'תמיד': 'Tamid',
  'מדות': 'Midot',
  'מידות': 'Midot',
  'נדה': 'Niddah',
  'נידה': 'Niddah',
};

const decoder = new TextDecoder('windows-1255');

async function fetchHebrewPage(fileName) {
  const res = await fetch(`${BASE_URL}${fileName}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${fileName}`);
  }
  const buffer = await res.arrayBuffer();
  return decoder.decode(buffer);
}

function parseAddIndexEntries(html) {
  const entries = [];
  const pattern = /AddIndex\(\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    entries.push({ title: match[1], file: match[2], kind: match[3] });
  }
  return entries;
}

function normalizeHebrew(value) {
  return value
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/["'`״׳]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveMasechetEn(rawTitle) {
  const normalized = normalizeHebrew(rawTitle);
  if (HE_ALIASES[normalized]) return HE_ALIASES[normalized];

  const direct = SHAS_MASECHTOT.find((m) => normalizeHebrew(m.he) === normalized);
  if (direct) return direct.en;

  return null;
}

function extractChavrutaTitle(bookTitle) {
  const normalized = normalizeHebrew(bookTitle);
  if (!normalized.startsWith('חברותא')) return null;

  const withoutPrefix = normalized.replace(/^חברותא\s*-\s*/, '');
  const [namePart, ...restParts] = withoutPrefix.split('|');
  const rest = restParts.join('|');

  return {
    masechetTitle: namePart.trim(),
    withoutNotes: rest.includes('בלי הערות'),
  };
}

async function main() {
  console.log('Fetching Bavli index...');
  const indexHtml = await fetchHebrewPage(BAVLI_INDEX);
  const folders = parseAddIndexEntries(indexHtml).filter((e) => e.kind === 'folder');
  console.log(`Found ${folders.length} masechet folders.`);

  const sources = new Map();
  const unmatched = [];

  for (const folder of folders) {
    let folderHtml;
    try {
      folderHtml = await fetchHebrewPage(folder.file);
    } catch (error) {
      console.warn(`  ! failed ${folder.file}: ${error.message}`);
      continue;
    }

    const books = parseAddIndexEntries(folderHtml).filter((e) => e.kind === 'book');

    for (const book of books) {
      const parsed = extractChavrutaTitle(book.title);
      if (!parsed) continue;

      const masechetEn = resolveMasechetEn(parsed.masechetTitle);
      if (!masechetEn) {
        unmatched.push(`${folder.file} :: ${book.title}`);
        continue;
      }

      const fileId = book.file.replace(/\.html$/i, '');
      if (parsed.withoutNotes) continue;

      sources.set(masechetEn, { masechetEn, fileId });
    }
  }

  const ordered = SHAS_MASECHTOT.map((m) => sources.get(m.en)).filter(
    (entry) => entry && entry.fileId
  );

  console.log(`\nResolved Chavruta for ${ordered.length} masechtot.`);
  if (unmatched.length > 0) {
    console.log('Unmatched Chavruta titles:');
    unmatched.forEach((u) => console.log(`  - ${u}`));
  }

  const missing = SHAS_MASECHTOT.filter((m) => !sources.has(m.en)).map((m) => m.he);
  if (missing.length > 0) {
    console.log(`Masechtot without Chavruta: ${missing.join(', ')}`);
  }

  const rows = ordered
    .map((entry) => `  { masechetEn: '${entry.masechetEn}', fileId: '${entry.fileId}' },`)
    .join('\n');

  const fileContents = `export interface ChavrutaSource {
  masechetEn: string;
  fileId: string;
}

export const CHAVRUTA_BASE_URL = 'https://www.toratemetfreeware.com/online/';

export const CHAVRUTA_SOURCES: ChavrutaSource[] = [
${rows}
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
  return \`\${CHAVRUTA_BASE_URL}\${source.fileId}.html\`;
}
`;

  fs.writeFileSync(OUTPUT_PATH, fileContents, 'utf-8');
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
