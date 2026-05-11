export type Seder = "zeraim" | "moed" | "nashim" | "nezikin" | "kodashim" | "taharot";

export interface Masechet {
  en: string;
  he: string;
  pages: number;
  seder: Seder;
}

export const SEDARIM = [
  { id: "zeraim" as Seder, he: "זרעים", en: "Zeraim" },
  { id: "moed" as Seder, he: "מועד", en: "Moed" },
  { id: "nashim" as Seder, he: "נשים", en: "Nashim" },
  { id: "nezikin" as Seder, he: "נזיקין", en: "Nezikin" },
  { id: "kodashim" as Seder, he: "קדשים", en: "Kodashim" },
  { id: "taharot" as Seder, he: "טהרות", en: "Taharot" },
];

export const SHAS_MASECHTOT: Masechet[] = [
  { en: "Berachot", he: "ברכות", pages: 63, seder: "zeraim" },
  { en: "Shabbat", he: "שבת", pages: 156, seder: "moed" },
  { en: "Eruvin", he: "עירובין", pages: 104, seder: "moed" },
  { en: "Pesachim", he: "פסחים", pages: 120, seder: "moed" },
  { en: "Shekalim", he: "שקלים", pages: 21, seder: "moed" },
  { en: "Yoma", he: "יומא", pages: 87, seder: "moed" },
  { en: "Sukkah", he: "סוכה", pages: 55, seder: "moed" },
  { en: "Beitzah", he: "ביצה", pages: 39, seder: "moed" },
  { en: "Rosh Hashana", he: "ראש השנה", pages: 34, seder: "moed" },
  { en: "Taanit", he: "תענית", pages: 30, seder: "moed" },
  { en: "Megillah", he: "מגילה", pages: 31, seder: "moed" },
  { en: "Moed Katan", he: "מועד קטן", pages: 28, seder: "moed" },
  { en: "Chagigah", he: "חגיגה", pages: 26, seder: "moed" },
  { en: "Yevamot", he: "יבמות", pages: 121, seder: "nashim" },
  { en: "Ketubot", he: "כתובות", pages: 111, seder: "nashim" },
  { en: "Nedarim", he: "נדרים", pages: 90, seder: "nashim" },
  { en: "Nazir", he: "נזיר", pages: 65, seder: "nashim" },
  { en: "Sotah", he: "סוטה", pages: 48, seder: "nashim" },
  { en: "Gitin", he: "גיטין", pages: 89, seder: "nashim" },
  { en: "Kiddushin", he: "קידושין", pages: 81, seder: "nashim" },
  { en: "Baba Kamma", he: "בבא קמא", pages: 118, seder: "nezikin" },
  { en: "Baba Metzia", he: "בבא מציעא", pages: 118, seder: "nezikin" },
  { en: "Baba Batra", he: "בבא בתרא", pages: 175, seder: "nezikin" },
  { en: "Sanhedrin", he: "סנהדרין", pages: 112, seder: "nezikin" },
  { en: "Makkot", he: "מכות", pages: 23, seder: "nezikin" },
  { en: "Shevuot", he: "שבועות", pages: 48, seder: "nezikin" },
  { en: "Avodah Zarah", he: "עבודה זרה", pages: 75, seder: "nezikin" },
  { en: "Horayot", he: "הוריות", pages: 13, seder: "nezikin" },
  { en: "Zevachim", he: "זבחים", pages: 119, seder: "kodashim" },
  { en: "Menachot", he: "מנחות", pages: 109, seder: "kodashim" },
  { en: "Chullin", he: "חולין", pages: 141, seder: "kodashim" },
  { en: "Bechorot", he: "בכורות", pages: 60, seder: "kodashim" },
  { en: "Arachin", he: "ערכין", pages: 33, seder: "kodashim" },
  { en: "Temurah", he: "תמורה", pages: 33, seder: "kodashim" },
  { en: "Keritot", he: "כריתות", pages: 27, seder: "kodashim" },
  { en: "Meilah", he: "מעילה", pages: 21, seder: "kodashim" },
  { en: "Kinnim", he: "קינים", pages: 3, seder: "kodashim" },
  { en: "Tamid", he: "תמיד", pages: 8, seder: "kodashim" },
  { en: "Midot", he: "מדות", pages: 4, seder: "kodashim" },
  { en: "Niddah", he: "נדה", pages: 72, seder: "taharot" }
];

export function numberToGematria(num: number): string {
  if (num <= 0) return '';
  const letters: { [key: number]: string } = {
    100: 'ק', 90: 'צ', 80: 'פ', 70: 'ע', 60: 'ס', 50: 'נ', 40: 'מ', 30: 'ל', 20: 'כ', 10: 'י',
    9: 'ט', 8: 'ח', 7: 'ז', 6: 'ו', 5: 'ה', 4: 'ד', 3: 'ג', 2: 'ב', 1: 'א'
  };
  
  if (num === 15) return 'טו';
  if (num === 16) return 'טז';
  
  let result = '';
  let remaining = num;
  
  for (const val of [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]) {
    while (remaining >= val) {
      result += letters[val];
      remaining -= val;
    }
  }
  
  if (result.length === 1) {
    return result + "'";
  } else if (result.length > 1) {
    return result.slice(0, -1) + '"' + result.slice(-1);
  }
  
  return result;
}
