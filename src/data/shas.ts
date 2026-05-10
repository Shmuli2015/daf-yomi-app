export const SHAS_MASECHTOT = [
  { en: "Berachot", he: "ברכות", pages: 64 },
  { en: "Shabbat", he: "שבת", pages: 157 },
  { en: "Eruvin", he: "עירובין", pages: 105 },
  { en: "Pesachim", he: "פסחים", pages: 121 },
  { en: "Shekalim", he: "שקלים", pages: 22 },
  { en: "Yoma", he: "יומא", pages: 88 },
  { en: "Sukkah", he: "סוכה", pages: 56 },
  { en: "Beitzah", he: "ביצה", pages: 40 },
  { en: "Rosh Hashana", he: "ראש השנה", pages: 35 },
  { en: "Taanit", he: "תענית", pages: 31 },
  { en: "Megillah", he: "מגילה", pages: 32 },
  { en: "Moed Katan", he: "מועד קטן", pages: 29 },
  { en: "Chagigah", he: "חגיגה", pages: 27 },
  { en: "Yevamot", he: "יבמות", pages: 122 },
  { en: "Ketubot", he: "כתובות", pages: 112 },
  { en: "Nedarim", he: "נדרים", pages: 91 },
  { en: "Nazir", he: "נזיר", pages: 66 },
  { en: "Sotah", he: "סוטה", pages: 49 },
  { en: "Gitin", he: "גיטין", pages: 90 },
  { en: "Kiddushin", he: "קידושין", pages: 82 },
  { en: "Baba Kamma", he: "בבא קמא", pages: 119 },
  { en: "Baba Metzia", he: "בבא מציעא", pages: 119 },
  { en: "Baba Batra", he: "בבא בתרא", pages: 176 },
  { en: "Sanhedrin", he: "סנהדרין", pages: 113 },
  { en: "Makkot", he: "מכות", pages: 24 },
  { en: "Shevuot", he: "שבועות", pages: 49 },
  { en: "Avodah Zarah", he: "עבודה זרה", pages: 76 },
  { en: "Horayot", he: "הוריות", pages: 14 },
  { en: "Zevachim", he: "זבחים", pages: 120 },
  { en: "Menachot", he: "מנחות", pages: 110 },
  { en: "Chullin", he: "חולין", pages: 142 },
  { en: "Bechorot", he: "בכורות", pages: 61 },
  { en: "Arachin", he: "ערכין", pages: 34 },
  { en: "Temurah", he: "תמורה", pages: 34 },
  { en: "Keritot", he: "כריתות", pages: 28 },
  { en: "Meilah", he: "מעילה", pages: 22 },
  { en: "Kinnim", he: "קינים", pages: 25 },
  { en: "Tamid", he: "תמיד", pages: 33 },
  { en: "Midot", he: "מדות", pages: 37 },
  { en: "Niddah", he: "נדה", pages: 73 }
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
