export const SHAS_MASECHTOT = [
  { en: "Berachot", he: "ברכות", pages: 63 },
  { en: "Shabbat", he: "שבת", pages: 156 },
  { en: "Eruvin", he: "עירובין", pages: 104 },
  { en: "Pesachim", he: "פסחים", pages: 120 },
  { en: "Shekalim", he: "שקלים", pages: 21 },
  { en: "Yoma", he: "יומא", pages: 87 },
  { en: "Sukkah", he: "סוכה", pages: 55 },
  { en: "Beitzah", he: "ביצה", pages: 39 },
  { en: "Rosh Hashana", he: "ראש השנה", pages: 34 },
  { en: "Taanit", he: "תענית", pages: 30 },
  { en: "Megillah", he: "מגילה", pages: 31 },
  { en: "Moed Katan", he: "מועד קטן", pages: 28 },
  { en: "Chagigah", he: "חגיגה", pages: 26 },
  { en: "Yevamot", he: "יבמות", pages: 121 },
  { en: "Ketubot", he: "כתובות", pages: 111 },
  { en: "Nedarim", he: "נדרים", pages: 90 },
  { en: "Nazir", he: "נזיר", pages: 65 },
  { en: "Sotah", he: "סוטה", pages: 48 },
  { en: "Gitin", he: "גיטין", pages: 89 },
  { en: "Kiddushin", he: "קידושין", pages: 81 },
  { en: "Baba Kamma", he: "בבא קמא", pages: 118 },
  { en: "Baba Metzia", he: "בבא מציעא", pages: 118 },
  { en: "Baba Batra", he: "בבא בתרא", pages: 175 },
  { en: "Sanhedrin", he: "סנהדרין", pages: 112 },
  { en: "Makkot", he: "מכות", pages: 23 },
  { en: "Shevuot", he: "שבועות", pages: 48 },
  { en: "Avodah Zarah", he: "עבודה זרה", pages: 75 },
  { en: "Horayot", he: "הוריות", pages: 13 },
  { en: "Zevachim", he: "זבחים", pages: 119 },
  { en: "Menachot", he: "מנחות", pages: 109 },
  { en: "Chullin", he: "חולין", pages: 141 },
  { en: "Bechorot", he: "בכורות", pages: 60 },
  { en: "Arachin", he: "ערכין", pages: 33 },
  { en: "Temurah", he: "תמורה", pages: 33 },
  { en: "Keritot", he: "כריתות", pages: 27 },
  { en: "Meilah", he: "מעילה", pages: 21 },
  { en: "Kinnim", he: "קינים", pages: 3 },
  { en: "Tamid", he: "תמיד", pages: 8 },
  { en: "Midot", he: "מדות", pages: 4 },
  { en: "Niddah", he: "נדה", pages: 72 }
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
