export interface ContentLicenseLink {
  label: string;
  url: string;
}

export interface ContentLicenseEntry {
  id: string;
  title: string;
  attribution: string;
  licenseLabel: string;
  links: ContentLicenseLink[];
}

export const SEFARIA_URL = 'https://www.sefaria.org';
export const CC_BY_URL = 'https://creativecommons.org/licenses/by/4.0/deed.he';
export const CC_BY_NC_URL = 'https://creativecommons.org/licenses/by-nc/4.0/deed.he';
export const CC_BY_NC_SA_25_URL = 'https://creativecommons.org/licenses/by-nc-sa/2.5/deed.he';
export const KOREN_URL = 'https://korenpub.co.il';
export const DICTA_URL = 'https://dicta.org.il';
export const NLI_VILNA_URL = 'https://www.nli.org.il/he/books/NNL_ALEPH001300957';
export const NLI_YERUSHALMI_PIOTRKOW_URL = 'https://www.nli.org.il/he/books/NNL_ALEPH001886777/NLI';
export const TORAT_EMET_URL = 'https://www.toratemetfreeware.com/';
export const TORAT_EMET_RIGHTS_URL = 'http://www.toratemetfreeware.com/online/a_rights.html';

export const SEFARIA_BADGE_LIGHT_URL =
  'https://www.sefaria.org/static/img/powered-by-sefaria-badge.png';
export const SEFARIA_BADGE_DARK_URL =
  'https://www.sefaria.org/static/img/powered-by-sefaria-badge-light.png';

export const READER_ATTRIBUTION_SHORT =
  'טקסט הגמרא המנוקד: מהדורת ויליאם דייוידסון, הוצאת קורן, ברישיון CC BY-NC, דרך ספריא';

export const MISHNAH_ATTRIBUTION_SHORT =
  'טקסט המשנה: נחלת הכלל, מתוך תורת אמת ודפוס וילנא, דרך ספריא';

export const SHEKALIM_ATTRIBUTION_SHORT =
  'טקסט ירושלמי שקלים: מהדורת היינריך ו. גוגנהיימר, ברישיון CC BY, דרך ספריא';

export const COMMENTARY_ATTRIBUTION_SHORT =
  'ביאור שטיינזלץ: מהדורת ויליאם דייוידסון, הוצאת קורן, ברישיון CC BY-NC, דרך ספריא';

export const SHEKALIM_STEINSALTZ_ATTRIBUTION_SHORT =
  'ביאור שטיינזלץ לירושלמי שקלים: מהדורת ויליאם דייוידסון דרך ספריא. הרישיון לגרסה זו אינו מאושר בספריא';

export function gemaraAttributionForTref(tref: string): string {
  if (tref.includes('Mishnah_Kinnim') || tref.includes('Mishnah_Middot')) {
    return MISHNAH_ATTRIBUTION_SHORT;
  }
  if (tref.includes('Jerusalem_Talmud_Shekalim')) {
    return SHEKALIM_ATTRIBUTION_SHORT;
  }
  return READER_ATTRIBUTION_SHORT;
}

export function steinsaltzAttributionForTref(tref: string): string {
  if (tref.includes('Jerusalem_Talmud_Shekalim')) {
    return SHEKALIM_STEINSALTZ_ATTRIBUTION_SHORT;
  }
  return COMMENTARY_ATTRIBUTION_SHORT;
}

export const CHAVRUTA_ATTRIBUTION_SHORT =
  'ביאור חברותא מאת הרב יעקב שולביץ, מתוך מאגר תורת אמת, ברישיון CC BY-NC-SA 2.5';

export const SEFARIA_INDEPENDENCE_NOTE =
  'מסע דף היא אפליקציה עצמאית וחינמית, ואינה מבית ספריא.';

export const NON_COMMERCIAL_NOTE =
  'האפליקציה מוצעת ללא תשלום, ללא פרסומות וללא רכישות, ולכן השימוש בטקסטים המוגבלים לשימוש לא מסחרי תואם את תנאי הרישיון.';

export const SEFARIA_BADGE_FALLBACK_TEXT = 'מופעל באמצעות ספריא';

export const CONTENT_LICENSES: ContentLicenseEntry[] = [
  {
    id: 'gemara',
    title: 'טקסט הגמרא המנוקד',
    attribution:
      'הטקסט הארמי המנוקד מתוך מהדורת ויליאם דייוידסון הדיגיטלית של תלמוד קורן נאה. הניקוד בידי דיקטה, המרכז הישראלי לניתוח טקסטים. הטקסט מתקבל דרך ספריא.',
    licenseLabel: 'CC BY-NC',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'הוצאת קורן', url: KOREN_URL },
      { label: 'דיקטה', url: DICTA_URL },
      { label: 'תנאי הרישיון', url: CC_BY_NC_URL },
    ],
  },
  {
    id: 'steinsaltz',
    title: 'ביאור שטיינזלץ',
    attribution:
      'ביאורו של הרב עדין אבן־ישראל שטיינזלץ על התלמוד הבבלי מתוך מהדורת ויליאם דייוידסון הדיגיטלית, בהוצאת קורן ירושלים, המתקבל דרך ספריא.',
    licenseLabel: 'CC BY-NC',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'הוצאת קורן', url: KOREN_URL },
      { label: 'תנאי הרישיון', url: CC_BY_NC_URL },
    ],
  },
  {
    id: 'rashi',
    title: 'רש״י ותוספות',
    attribution:
      'פירושי רש״י ותוספות מתוך דפוס וילנא, שהוא נחלת הכלל. הטקסט מתקבל דרך ספריא, על בסיס סריקות הספרייה הלאומית.',
    licenseLabel: 'נחלת הכלל',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'הספרייה הלאומית', url: NLI_VILNA_URL },
    ],
  },
  {
    id: 'tamid-commentators',
    title: 'המפרש והרא״ש על תמיד',
    attribution:
      'פירוש המפרש ופירוש הרא״ש על מסכת תמיד מתוך דפוס וילנא, שהוא נחלת הכלל. בדפוס וילנא נדפס המפרש בלי ייחוס; בספריא משוער כי מחברו הוא רבי ברוך בן יצחק. הטקסט מתקבל דרך ספריא, על בסיס סריקות הספרייה הלאומית.',
    licenseLabel: 'נחלת הכלל',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'הספרייה הלאומית', url: NLI_VILNA_URL },
    ],
  },
  {
    id: 'shekalim-text',
    title: 'טקסט ירושלמי שקלים',
    attribution:
      'טקסט הירושלמי המנוקד למסכת שקלים מתוך מהדורת היינריך ו. גוגנהיימר, הוצאת דה גרויטר, ברישיון CC BY. הטקסט מתקבל דרך ספריא.',
    licenseLabel: 'CC BY',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'תנאי הרישיון', url: CC_BY_URL },
    ],
  },
  {
    id: 'steinsaltz-shekalim',
    title: 'ביאור שטיינזלץ על ירושלמי שקלים',
    attribution:
      'ביאור שטיינזלץ לירושלמי שקלים מתקבל דרך ספריא ממהדורת ויליאם דייוידסון. ספריא אינה מציינת רישיון מאושר לגרסה זו.',
    licenseLabel: 'לא צוין בספריא',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'הוצאת קורן', url: KOREN_URL },
    ],
  },
  {
    id: 'shekalim-yerushalmi',
    title: 'מפרשי ירושלמי שקלים',
    attribution:
      'פירושי קרבן העדה, פני משה, רידב״ז ושיירי קרבן על ירושלמי שקלים מתוך דפוס פיטרקוב, שהוא נחלת הכלל. הטקסט מתקבל דרך ספריא, על בסיס סריקות הספרייה הלאומית.',
    licenseLabel: 'נחלת הכלל',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'הספרייה הלאומית', url: NLI_YERUSHALMI_PIOTRKOW_URL },
    ],
  },
  {
    id: 'mishnah',
    title: 'משנה קינים ומדות',
    attribution:
      'טקסט המשנה המנוקד למסכתות קינים ומדות, שאין להן גמרא בבלי, מתוך מאגר תורת אמת ודפוס וילנא, שהוא נחלת הכלל. הטקסט מתקבל דרך ספריא.',
    licenseLabel: 'נחלת הכלל',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'תורת אמת', url: TORAT_EMET_URL },
    ],
  },
  {
    id: 'bartenura',
    title: 'ברטנורא ורמב״ם על המשנה',
    attribution:
      'פירוש ר׳ עובדיה מברטנורא למשנה מתקבל דרך ספריא ממאגר תורת אמת, ברישיון CC BY-NC. פירוש הרמב״ם למשנה הוא נחלת הכלל ומתקבל דרך ספריא.',
    licenseLabel: 'CC BY-NC / נחלת הכלל',
    links: [
      { label: 'ספריא', url: SEFARIA_URL },
      { label: 'תורת אמת', url: TORAT_EMET_URL },
      { label: 'תנאי הרישיון', url: CC_BY_NC_URL },
    ],
  },
  {
    id: 'chavruta',
    title: 'ביאור חברותא',
    attribution:
      'ביאורו של הרב יעקב שולביץ לתלמוד בבלי, המתקבל ממאגר תורת אמת. הזכויות שמורות למחבר, וההפצה מותרת לפי תנאי Creative Commons ייחוס–לא מסחרי–שיתוף זהה 2.5.',
    licenseLabel: 'CC BY-NC-SA 2.5',
    links: [
      { label: 'תורת אמת', url: TORAT_EMET_URL },
      { label: 'תנאי הרישיון', url: CC_BY_NC_SA_25_URL },
      { label: 'תנאי המאגר', url: TORAT_EMET_RIGHTS_URL },
    ],
  },
];
