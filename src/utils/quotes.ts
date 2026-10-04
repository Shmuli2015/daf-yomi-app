export type QuoteCategory =
  | 'chazal'
  | 'tanakh'
  | 'avot'
  | 'gedolim'
  | 'chassidut'
  | 'daf_yomi'
  | 'inspiration';

export interface DafYomiQuote {
  id: string;
  text: string;
  source?: string;
  author?: string;
  category: QuoteCategory;
}

export const QUOTES: readonly DafYomiQuote[] = [
  {
    id: 'chazal-pesachim-50a',
    text: 'אשרי מי שבא לכאן ותלמודו בידו',
    source: 'פסחים נ.',
    category: 'chazal',
  },
  {
    id: 'chazal-shabbat-31a',
    text: 'בשעה שמכניסין אדם לדין שואלין אותו: קבעת עתים לתורה?',
    source: 'שבת לא.',
    category: 'chazal',
  },
  {
    id: 'chazal-kiddushin-30a',
    text: 'ושננתם לבניך - שיהיו דברי תורה מחודדים בפיך, שאם ישאלך אדם דבר אל תגמגם, אלא אמור לו מיד',
    source: 'קידושין ל.',
    category: 'chazal',
  },
  {
    id: 'chazal-avodah-zarah-19a-1',
    text: 'לעולם יגרוס איניש ואף על גב דמשכח, ואף על גב דלא ידע מאי קאמר',
    source: 'עבודה זרה יט.',
    category: 'chazal',
  },
  {
    id: 'chazal-chagigah-9b-1',
    text: 'אינו דומה שונה פרקו מאה פעמים לשונה מאה ואחד',
    source: 'חגיגה ט:',
    category: 'chazal',
  },
  {
    id: 'chazal-sanhedrin-99a-1',
    text: 'כל הלומד תורה ואינו חוזר עליה, דומה לאדם שזורע ואינו קוצר',
    source: 'סנהדרין צט.',
    category: 'chazal',
  },
  {
    id: 'chazal-megillah-6b',
    text: 'יגעת ומצאת - תאמין',
    source: 'מגילה ו:',
    category: 'chazal',
  },
  {
    id: 'chazal-chagigah-12b',
    text: 'כל העוסק בתורה בלילה, חוט של חסד נמשך עליו ביום',
    source: 'חגיגה יב:',
    category: 'chazal',
  },
  {
    id: 'chazal-tamid-32b',
    text: 'כל העוסק בתורה בלילה, שכינה כנגדו',
    source: 'תמיד לב:',
    category: 'chazal',
  },
  {
    id: 'chazal-berakhot-63b',
    text: 'אין דברי תורה נקנין אלא בחבורה',
    source: 'ברכות סג:',
    category: 'chazal',
  },
  {
    id: 'chazal-kiddushin-40b',
    text: 'גדול תלמוד שמביא לידי מעשה',
    source: 'קידושין מ:',
    category: 'chazal',
  },
  {
    id: 'chazal-eichah-rabbah-2',
    text: 'הלוואי אותי עזבו ותורתי שמרו, שהמאור שבה מחזירן למוטב',
    source: 'איכה רבה, פתיחתא ב',
    category: 'chazal',
  },
  {
    id: 'chazal-niddah-73a',
    text: 'כל השונה הלכות בכל יום מובטח לו שהוא בן העולם הבא',
    source: 'נידה עג.',
    category: 'chazal',
  },
  {
    id: 'chazal-avodah-zarah-19a-2',
    text: 'לעולם ילמד אדם תורה במקום שלבו חפץ',
    source: 'עבודה זרה יט.',
    category: 'chazal',
  },
  {
    id: 'chazal-peah-1-1',
    text: 'ותלמוד תורה כנגד כולם',
    source: 'פאה א, א',
    category: 'chazal',
  },
  {
    id: 'chazal-yerushalmi-berakhot-9-5',
    text: 'אם תעזבני יום, יומיים אעזבך',
    source: 'ירושלמי ברכות ט, ה',
    category: 'chazal',
  },
  {
    id: 'chazal-sotah-21b',
    text: 'אמר רבי יוחנן: אין דברי תורה מתקיימין אלא במי שמשים עצמו כמי שאינו',
    source: 'סוטה כא:',
    category: 'chazal',
  },
  {
    id: 'chazal-avodah-zarah-19a-3',
    text: 'לעולם ילמד אדם תורה ואחר כך יהגה',
    source: 'עבודה זרה יט.',
    category: 'chazal',
  },
  {
    id: 'chazal-berakhot-7b',
    text: 'כל הקובע מקום לתורתו, אויביו נופלים תחתיו',
    source: 'ברכות ז:',
    category: 'chazal',
  },
  {
    id: 'chazal-pesachim-120b',
    text: 'לעולם לא ימנע אדם עצמו מבית המדרש ומדברי תורה אפילו שעה אחת',
    source: 'פסחים קכ:',
    category: 'chazal',
  },
  {
    id: 'chazal-chagigah-9b-2',
    text: 'אמר רבי אבהו: בא וראה כמה קשים דברי תורה לקנותן כשני כלי זהב, וכמה נוחים לאבדן ככלי זכוכית',
    source: 'חגיגה ט:',
    category: 'chazal',
  },
  {
    id: 'chazal-moed-katan-16b',
    text: 'כל העוסק בתורה מבפנים, תורתו מכרזת עליו מבחוץ',
    source: 'מועד קטן טז:',
    category: 'chazal',
  },
  {
    id: 'chazal-sanhedrin-99a-2',
    text: 'אדם לעמל יולד - אשריו אם עמלו בתורה',
    source: 'סנהדרין צט.',
    category: 'chazal',
  },
  {
    id: 'chazal-tanchuma-noach-3',
    text: 'התורה אינה נקנית אלא ביגיעה',
    source: 'תנחומא, נח ג',
    category: 'chazal',
  },
  {
    id: 'chazal-shir-hashirim-rabbah-5-2',
    text: 'פתחו לי פתח כחודו של מחט, ואני אפתח לכם פתח כפתחו של אולם',
    source: 'שיר השירים רבה ה, ב',
    category: 'chazal',
  },
  {
    id: 'chazal-tanchuma-nitzavim-4',
    text: 'כשם שקטן שבציפורנים יש בו חיות לכל הגוף, כך קטן שבישראל הלומד תורה מקיים את כל העולם',
    source: 'תנחומא, נצבים ד',
    category: 'chazal',
  },

  {
    id: 'tanakh-tehillim-119-72',
    text: 'טוב לי תורת פיך מאלפי זהב וכסף',
    source: 'תהילים קיט, עב',
    category: 'tanakh',
  },
  {
    id: 'tanakh-tehillim-119-18',
    text: 'גל עיני ואביטה נפלאות מתורתך',
    source: 'תהילים קיט, יח',
    category: 'tanakh',
  },
  {
    id: 'tanakh-mishlei-3-17',
    text: 'דרכיה דרכי נועם וכל נתיבותיה שלום',
    source: 'משלי ג, יז',
    category: 'tanakh',
  },
  {
    id: 'tanakh-mishlei-3-18',
    text: 'עץ חיים היא למחזיקים בה ותומכיה מאושר',
    source: 'משלי ג, יח',
    category: 'tanakh',
  },
  {
    id: 'tanakh-yehoshua-1-8',
    text: 'לא ימוש ספר התורה הזה מפיך והגית בו יומם ולילה',
    source: 'יהושע א, ח',
    category: 'tanakh',
  },
  {
    id: 'tanakh-tehillim-19-8',
    text: 'תורת ה׳ תמימה משיבת נפש, עדות ה׳ נאמנה מחכימת פתי',
    source: 'תהילים יט, ח',
    category: 'tanakh',
  },
  {
    id: 'tanakh-tehillim-19-11',
    text: 'הנחמדים מזהב ומפז רב ומתוקים מדבש ונופת צופים',
    source: 'תהילים יט, יא',
    category: 'tanakh',
  },
  {
    id: 'tanakh-tehillim-119-105',
    text: 'נר לרגלי דבריך ואור לנתיבתי',
    source: 'תהילים קיט, קה',
    category: 'tanakh',
  },
  {
    id: 'tanakh-tehillim-19-9',
    text: 'פקודי ה׳ ישרים משמחי לב',
    source: 'תהילים יט, ט',
    category: 'tanakh',
  },
  {
    id: 'tanakh-tefillah-arvit',
    text: 'כי הם חיינו ואורך ימינו ובהם נהגה יומם ולילה',
    source: 'תפילת ערבית',
    category: 'tanakh',
  },

  {
    id: 'avot-1-15',
    text: 'עשה תורתך קבע',
    source: 'פרקי אבות א, טו',
    author: 'שמאי',
    category: 'avot',
  },
  {
    id: 'avot-2-16',
    text: 'לא עליך המלאכה לגמור, ולא אתה בן חורין ליבטל ממנה',
    source: 'פרקי אבות ב, טז',
    author: 'רבי טרפון',
    category: 'avot',
  },
  {
    id: 'avot-6-2',
    text: 'אין לך בן חורין אלא מי שעוסק בתלמוד תורה',
    source: 'פרקי אבות ו, ב',
    author: 'רבי יהושע בן לוי',
    category: 'avot',
  },
  {
    id: 'avot-2-4',
    text: 'אל תאמר לכשאפנה אשנה, שמא לא תפנה',
    source: 'פרקי אבות ב, ד',
    author: 'הלל',
    category: 'avot',
  },
  {
    id: 'avot-2-15',
    text: 'היום קצר והמלאכה מרובה והפועלים עצלים והשכר הרבה, ובעל הבית דוחק',
    source: 'פרקי אבות ב, טו',
    author: 'רבי טרפון',
    category: 'avot',
  },
  {
    id: 'avot-2-8',
    text: 'אם למדת תורה הרבה - אל תחזיק טובה לעצמך, כי לכך נוצרת',
    source: 'פרקי אבות ב, ח',
    author: 'רבן יוחנן בן זכאי',
    category: 'avot',
  },
  {
    id: 'avot-6-1',
    text: 'כל העוסק בתורה לשמה, זוכה לדברים הרבה',
    source: 'פרקי אבות ו, א',
    author: 'רבי מאיר',
    category: 'avot',
  },
  {
    id: 'avot-1-14',
    text: 'אם אין אני לי מי לי, וכשאני לעצמי מה אני, ואם לא עכשיו אימתי',
    source: 'פרקי אבות א, יד',
    author: 'הלל',
    category: 'avot',
  },
  {
    id: 'avot-5-22',
    text: 'הפוך בה והפוך בה, דכולא בה',
    source: 'פרקי אבות ה, כב',
    author: 'בן בג בג',
    category: 'avot',
  },
  {
    id: 'avot-2-7',
    text: 'מרבה תורה מרבה חיים',
    source: 'פרקי אבות ב, ז',
    author: 'הלל',
    category: 'avot',
  },
  {
    id: 'avot-4-20',
    text: 'הלומד ילד למה הוא דומה? לדיו כתובה על נייר חדש',
    source: 'פרקי אבות ד, כ',
    author: 'אלישע בן אבויה',
    category: 'avot',
  },
  {
    id: 'avot-6-6',
    text: 'התורה נקנית בארבעים ושמונה דברים',
    source: 'פרקי אבות ו, ו',
    category: 'avot',
  },

  {
    id: 'gedolim-rambam-1-8',
    text: 'כל איש מישראל חייב בתלמוד תורה: בין עני בין עשיר, בין שלם בגופו בין בעל יסורין',
    source: 'רמב״ם, הלכות תלמוד תורה א, ח',
    author: 'הרמב״ם',
    category: 'gedolim',
  },
  {
    id: 'gedolim-rambam-1-10',
    text: 'עד אימתי חייב ללמוד? עד יום מותו',
    source: 'רמב״ם, הלכות תלמוד תורה א, י',
    author: 'הרמב״ם',
    category: 'gedolim',
  },
  {
    id: 'gedolim-rambam-3-1',
    text: 'כתר תורה הרי הוא מונח ועומד ומוכן לכל ישראל',
    source: 'רמב״ם, הלכות תלמוד תורה ג, א',
    author: 'הרמב״ם',
    category: 'gedolim',
  },
  {
    id: 'gedolim-rambam-3-12-a',
    text: 'אי אתה מוצא מי שנתקיימה תורתו בידו אלא במי שהטריח עצמו בה תמיד יומם ולילה',
    source: 'רמב״ם, הלכות תלמוד תורה ג, יב',
    author: 'הרמב״ם',
    category: 'gedolim',
  },
  {
    id: 'gedolim-rambam-3-12-b',
    text: 'אין דברי תורה מתקיימין במי שמרפה עצמו עליהן, אלא במי שממית עצמו עליהן',
    source: 'רמב״ם, הלכות תלמוד תורה ג, יב',
    author: 'הרמב״ם',
    category: 'gedolim',
  },
  {
    id: 'gedolim-shulchan-aruch-1-4',
    text: 'טוב מעט בכוונה מהרבות שלא בכוונה',
    source: 'שולחן ערוך, אורח חיים א, ד',
    author: 'המחבר',
    category: 'gedolim',
  },
  {
    id: 'gedolim-shaarei-teshuva-3-15',
    text: 'עניין קביעות עתים לתורה הוא עיקר גדול, שלא יעבור עליו יום בלא תורה',
    source: 'שערי תשובה ג, טו',
    author: 'רבנו יונה',
    category: 'gedolim',
  },
  {
    id: 'gedolim-meiri-avot',
    text: 'אין לך דבר המרומם נפש האדם ומעדנה כלימוד הגמרא בעיון ובבקיאות',
    source: 'הקדמה למסכת אבות',
    author: 'המאירי',
    category: 'gedolim',
  },
  {
    id: 'gedolim-gra-iggeret',
    text: 'בכל רגע ורגע שאדם עוסק בתורה הוא מקיים מצוות עשה',
    source: 'אגרת הגר״א',
    author: 'הגר״א',
    category: 'gedolim',
  },
  {
    id: 'gedolim-gra-shenot-eliyahu',
    text: 'כל דיבור ודיבור של לימוד תורה נברא ממנו מלאך טוב',
    source: 'שנות אליהו, פאה א, א',
    author: 'הגר״א',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chofetz-chaim-mb-155',
    text: 'קביעות עתים לתורה בכל יום היא ההצלה הגדולה של הנפש',
    source: 'משנה ברורה, סימן קנ״ה, ס״ק א',
    author: 'החפץ חיים',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chofetz-chaim-torat-habayit-1',
    text: 'בכל יום ויום צריך האדם לראות שיהיה לו חלק בתורת ה׳',
    source: 'תורת הבית',
    author: 'החפץ חיים',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chofetz-chaim-torat-habayit-2',
    text: 'אפילו שעה אחת ביום שקובע אדם לתורה, יש בה כוח להאיר את כל החושך',
    source: 'תורת הבית',
    author: 'החפץ חיים',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chofetz-chaim-letters',
    text: 'אם תלמד בכל יום דף אחד, בסוף תדע ש״ס; ואם לא תלמד בכל יום, יעברו השנים בלא כלום',
    source: 'מכתבי החפץ חיים',
    author: 'החפץ חיים',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chofetz-chaim-siyum',
    text: 'מי שמסיים מסכתות והולך לקראת סיום הש״ס, מביא ברכה עצומה לעולם',
    source: 'שיחות ומאמרים',
    author: 'החפץ חיים',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chazon-ish-emunah',
    text: 'נעימות התורה אין לה קץ, וכשמתרגלים בה נפתחים מעיינות החכמה',
    source: 'אמונה ובטחון',
    author: 'החזון איש',
    category: 'gedolim',
  },
  {
    id: 'gedolim-chazon-ish-peace',
    text: 'דף גמרא אחד מביא לאדם יישוב הדעת ורוגע שאין כמותם בעולם',
    source: 'קובץ אגרות',
    author: 'החזון איש',
    category: 'gedolim',
  },
  {
    id: 'gedolim-ben-ish-chai',
    text: 'לימוד הגמרא מטהר את המחשבה ומעלה את האדם מעלה מעלה',
    source: 'הקדמה לרב פעלים',
    author: 'הבן איש חי',
    category: 'gedolim',
  },
  {
    id: 'gedolim-abramsky',
    text: 'אין שמחה בעולם כשמחת הידיעה והקנייה של מסכת שלימה',
    source: 'הקדמה לחזון יחזקאל',
    author: 'רבי יחזקאל אברמסקי',
    category: 'gedolim',
  },
  {
    id: 'gedolim-shach-foundation',
    text: 'לימוד הבקיאות והיקף הש״ס הוא היסוד המוצק שעליו נבנה כל בית התורה',
    source: 'מכתבים ומאמרים',
    author: 'הגרא״מ שך',
    category: 'gedolim',
  },
  {
    id: 'gedolim-rozovsky',
    text: 'אין שום לימוד שבונה את שכל האדם ואישיותו כלימוד הש״ס כסדרו',
    source: 'שיעורי הגר״ש',
    author: 'הגר״ש רוזובסקי',
    category: 'gedolim',
  },
  {
    id: 'gedolim-elyashiv',
    text: 'מי שיודע ש״ס הולך בעולם בקומה זקופה של בן תורה',
    source: 'דברי פתיחה',
    author: 'הגרי״ש אלישיב',
    category: 'gedolim',
  },
  {
    id: 'gedolim-shteinman',
    text: 'כל דקה של לימוד תורה היא רווח נצחי שאין לו שום תמורה ושיעור בעולם',
    source: 'אילת השחר',
    author: 'הגראי״ל שטיינמן',
    category: 'gedolim',
  },
  {
    id: 'gedolim-steipler',
    text: 'אפילו כשאדם עייף ויגע, כוחה של התורה להחיות את הנפש ולהשיב את הרוח',
    source: 'חיי עולם',
    author: 'הסטייפלר',
    category: 'gedolim',
  },
  {
    id: 'gedolim-ovadia-yosef',
    text: 'התורה מאירה את הלב, וכל סוגיה בגמרא מרוממת את האדם מעל הגשמיות',
    source: 'הקדמה ליביע אומר',
    author: 'הרב עובדיה יוסף',
    category: 'gedolim',
  },
  {
    id: 'gedolim-feinstein',
    text: 'ידיעת הש״ס מקנה לאדם בהירות בכל מרחבי החיים',
    source: 'הקדמה לאגרות משה',
    author: 'הרב משה פיינשטיין',
    category: 'gedolim',
  },
  {
    id: 'gedolim-kook-orot-hatorah-1',
    text: 'ההקשבה לקול התורה מעוררת את כל כוחות הנפש לתחייה וגבורה',
    source: 'אורות התורה',
    author: 'הראי״ה קוק',
    category: 'gedolim',
  },
  {
    id: 'gedolim-kook-orot-hatorah-2',
    text: 'ההתמדה בלימוד מולידה את שמחת הלב ואת אהבת התורה הטהורה',
    source: 'אורות התורה',
    author: 'הראי״ה קוק',
    category: 'gedolim',
  },
  {
    id: 'gedolim-kook-orot-hakodesh',
    text: 'צריך שכל אדם ידע ויבין, שבתוך תוכו דולק נר, ואין נרו שלו כנר חברו',
    source: 'אורות הקודש ג',
    author: 'הראי״ה קוק',
    category: 'gedolim',
  },

  {
    id: 'daf-yomi-shapiro-1',
    text: 'איזהו קיבוץ גלויות גדול מזה, שיהודים בכל העולם ילמדו באותו יום את אותו הדף!',
    source: 'הכנסייה הגדולה תרפ״ג',
    author: 'רבי מאיר שפירא מלובלין',
    category: 'daf_yomi',
  },
  {
    id: 'daf-yomi-shapiro-2',
    text: 'הדף היומי הוא הגשר הטהור המחבר את כל נשמות ישראל סביב התלמוד',
    source: 'נאומי מהר״ם שפירא',
    author: 'רבי מאיר שפירא מלובלין',
    category: 'daf_yomi',
  },
  {
    id: 'daf-yomi-shapiro-3',
    text: 'כשאדם לומד דף יומי, הוא אינו צועד לבדו - כל בית ישראל צועד עמו',
    source: 'שיחות מהר״ם שפירא',
    author: 'רבי מאיר שפירא מלובלין',
    category: 'daf_yomi',
  },
  {
    id: 'daf-yomi-shapiro-4',
    text: 'יהודי נוסע ברכבת מארץ לארץ, נוטל גמרא עמו, ובכל מקום שיבוא ימצא יהודים העוסקים בדיוק באותו הדף',
    source: 'הכנסייה הגדולה תרפ״ג',
    author: 'רבי מאיר שפירא מלובלין',
    category: 'daf_yomi',
  },
  {
    id: 'daf-yomi-shapiro-5',
    text: 'הדף היומי הופך את כל העולם היהודי לבית מדרש אחד ענק',
    source: 'מכתבי מהר״ם שפירא',
    author: 'רבי מאיר שפירא מלובלין',
    category: 'daf_yomi',
  },
  {
    id: 'daf-yomi-imrei-emet',
    text: 'תקנת הדף היומי היא מתנה נפלאה שירדה לעולם לקשר את כל ישראל אל התלמוד',
    source: 'אמרי אמת',
    author: 'האמרי אמת מגור',
    category: 'daf_yomi',
  },

  {
    id: 'chassidut-breslov-1',
    text: 'טוב לאדם שירגיל את עצמו שיוכל ללמוד במהירות... ולעבור ספרים הרבה',
    source: 'שיחות הר״ן ע״ו',
    author: 'רבי נחמן מברסלב',
    category: 'chassidut',
  },
  {
    id: 'chassidut-breslov-2',
    text: 'אין צריכים בלימוד אלא אמירה לבד, ויאמר הדברים כסדר, וממילא יבין',
    source: 'שיחות הר״ן ע״ו',
    author: 'רבי נחמן מברסלב',
    category: 'chassidut',
  },
  {
    id: 'chassidut-breslov-3',
    text: 'כל התחלה קשה, אבל השמחה בסיום המסכת מוחקת כל קושי',
    source: 'ליקוטי מוהר״ן',
    author: 'רבי נחמן מברסלב',
    category: 'chassidut',
  },
  {
    id: 'chassidut-tzidkat-hatzaddik-154',
    text: 'כשם שצריך אדם להאמין בה׳ יתברך, כך צריך אחר כך להאמין בעצמו',
    source: 'צדקת הצדיק, אות קנ״ד',
    author: 'רבי צדוק הכהן מלובלין',
    category: 'chassidut',
  },
  {
    id: 'chassidut-tanya-5-a',
    text: 'זהו יחוד נפלא שאין יחוד כמוהו ולא כערכו נמצא כלל בגשמיות',
    source: 'תניא, פרק ה',
    author: 'בעל התניא',
    category: 'chassidut',
  },
  {
    id: 'chassidut-tanya-5-b',
    text: 'בלימוד התורה מתאחד השכל האנושי עם חכמת הבורא באחדות נפלאה שאין כדוגמתה',
    source: 'תניא, פרק ה',
    author: 'בעל התניא',
    category: 'chassidut',
  },
  {
    id: 'chassidut-keter-shem-tov-56',
    text: 'במקום שמחשבתו של אדם - שם הוא כולו',
    source: 'כתר שם טוב, אות נו',
    author: 'הבעל שם טוב',
    category: 'chassidut',
  },
  {
    id: 'chassidut-sfat-emet-likutim',
    text: 'דברי תורה הם עץ חיים, שמוציאים פירות והתחדשות בכל עת',
    source: 'שפת אמת, ליקוטים',
    author: 'השפת אמת',
    category: 'chassidut',
  },
  {
    id: 'chassidut-sfat-emet-renewal',
    text: 'בכל יום מתחדשת התורה מחדש, וכל דף שנלמד מאיר באור חדש שלא האיר מעולם',
    source: 'שפת אמת',
    author: 'השפת אמת',
    category: 'chassidut',
  },
  {
    id: 'chassidut-kotzk-never-stop',
    text: 'אם אינך יכול לרוץ - לך; אם אינך יכול ללכת - זחל; העיקר: לעולם אל תעצור מלימודך',
    source: 'אמרות קוצק',
    author: 'רבי מנחם מנדל מקוצק',
    category: 'chassidut',
  },

  {
    id: 'insp-day-by-day',
    text: 'דף אחרי דף, יום אחרי יום - כך כובשים את הש״ס.',
    category: 'inspiration',
  },
  {
    id: 'insp-siyum-journey',
    text: 'סיום הש״ס אינו חלום של יחידים, הוא מסע של צעד אחד בכל יום.',
    category: 'inspiration',
  },
  {
    id: 'insp-2711-pages',
    text: '2,711 דפים של אור - כל יום מקרב אותך אל היעד הנכסף.',
    category: 'inspiration',
  },
  {
    id: 'insp-shas-waits',
    text: 'הש״ס מחכה שתקנה אותו - דף אחר דף, מסכת אחר מסכת.',
    category: 'inspiration',
  },
  {
    id: 'insp-daily-victory',
    text: 'הקביעות היומית שלך היא הניצחון הכי גדול של היום.',
    category: 'inspiration',
  },
  {
    id: 'insp-consistency-wins',
    text: 'עקביות מנצחת הכל: דף אחד ביום בונה עולם ומלואו.',
    category: 'inspiration',
  },
  {
    id: 'insp-busy-day',
    text: 'גם ביום העמוס ביותר - דף אחד מטהר ומאיר את הכל.',
    category: 'inspiration',
  },
  {
    id: 'insp-ten-minutes',
    text: 'אין דבר כזה ״לא הספקתי״ - עשר דקות עם הגמרא שוות זהב.',
    category: 'inspiration',
  },
  {
    id: 'insp-quiet-gemara',
    text: 'השקט של הגמרא הוא המקום הכי שליו ביום שלך.',
    category: 'inspiration',
  },
  {
    id: 'insp-island-of-holiness',
    text: 'זמן הלימוד הוא אי של קדושה ובהירות בתוך מרוץ החיים.',
    category: 'inspiration',
  },
  {
    id: 'insp-defines-life',
    text: 'כשאדם קובע עת לתורה, התורה קובעת את איכות חייו.',
    category: 'inspiration',
  },
  {
    id: 'insp-starts-with-one',
    text: 'מסע הש״ס המופלא מתחיל בדף אחד יחיד.',
    category: 'inspiration',
  },
  {
    id: 'insp-eternal-asset',
    text: 'כל דף שתפתח היום הוא נכס נצחי שנשאר איתך לתמיד.',
    category: 'inspiration',
  },
  {
    id: 'insp-difference',
    text: 'ההבדל בין לרצות לדעת ש״ס לבין לדעת ש״ס הוא הדף של היום.',
    category: 'inspiration',
  },
  {
    id: 'insp-page-elevates',
    text: 'אתה לא רק לומד את הדף, הדף מעצב ומרומם אותך.',
    category: 'inspiration',
  },
  {
    id: 'insp-perseverance',
    text: 'התמדה איננה מהירות, היא הנאמנות לכל יום מחדש.',
    category: 'inspiration',
  },
  {
    id: 'insp-open-gemara',
    text: 'פתח את הגמרא, והעולם כולו ייראה אחרת.',
    category: 'inspiration',
  },
  {
    id: 'insp-power-for-tomorrow',
    text: 'הלימוד של היום הוא הכוח, השלווה והאור שלך למחר.',
    category: 'inspiration',
  },
  {
    id: 'insp-no-small-page',
    text: 'אין דף קטן. כל שורה וכל סוגיה הן עולם ומלואו.',
    category: 'inspiration',
  },
  {
    id: 'insp-forever-win',
    text: 'היום אתה לומד, מחר אתה חוזר, ולנצח אתה זוכה.',
    category: 'inspiration',
  },
  {
    id: 'insp-tired-brain',
    text: 'גם כשהמוח עייף, הלב מתרחב מול דף גמרא פתוח.',
    category: 'inspiration',
  },
  {
    id: 'insp-best-gift',
    text: 'המתנה הכי טובה שתעניק לעצמך היום היא שעת הלימוד.',
    category: 'inspiration',
  },
  {
    id: 'insp-global-learners',
    text: 'יהודי בירושלים, בפריז ובניו יורק פותחים היום בדיוק את אותו הדף.',
    category: 'inspiration',
  },
  {
    id: 'insp-beating-pulse',
    text: 'הדף היומי מחבר אותך לרבבות לומדים הפועמים בקצב אחד.',
    category: 'inspiration',
  },
  {
    id: 'insp-dont-give-up',
    text: 'פספסת יום? אל תיפול. הדף של היום מחכה לך באהבה.',
    category: 'inspiration',
  },
  {
    id: 'insp-abaye-and-rava',
    text: 'רגע של דף יומי - חיבור חי לקולותיהם של אביי ורבא.',
    category: 'inspiration',
  },
  {
    id: 'insp-last-page',
    text: 'כשתגיע לדף האחרון של הש״ס, תדע שכל מאמץ בדרך היה שווה הכל.',
    category: 'inspiration',
  },
  {
    id: 'insp-another-brick',
    text: 'היום מניחים עוד לבנה בבניין התורה והנצח שלך.',
    category: 'inspiration',
  },
  {
    id: 'insp-won-the-day',
    text: 'קבעת עת לתורה? ניצחת את היום כולו.',
    category: 'inspiration',
  },
  {
    id: 'insp-ocean-of-talmud',
    text: 'ים התלמוד מחכה לצוללים לתוכו - קח נשימה עמוקה וצלול.',
    category: 'inspiration',
  },
  {
    id: 'insp-golden-letters',
    text: 'גם דף שנלמד בעייפות - בשמים הוא נכתב באותיות של זהב.',
    category: 'inspiration',
  },
  {
    id: 'insp-seven-years',
    text: 'שבע וחצי שנים נראות ארוכות, אך הן חולפות דף אחר דף.',
    category: 'inspiration',
  },
  {
    id: 'insp-not-just-for-few',
    text: 'סיום הש״ס אינו שמור ליחידי סגולה, אלא למי שקם בכל בוקר ולומד דף אחד.',
    category: 'inspiration',
  },
  {
    id: 'insp-hardest-day',
    text: 'ביום שבו הכי קשה לפתוח את הגמרא, שם בדיוק נבנה הכתר שלך.',
    category: 'inspiration',
  },
  {
    id: 'insp-one-more-line',
    text: 'עוד שורה, עוד סוגיה, עוד דף - צעד קטן לאדם, קפיצה לנצח.',
    category: 'inspiration',
  },
  {
    id: 'insp-anchor-of-routine',
    text: 'הקביעות הזו היא העוגן היציב ביותר בסערות השגרה.',
    category: 'inspiration',
  },
];

export function formatQuote(quote: DafYomiQuote): string {
  if (!quote.source) {
    return quote.text;
  }
  return `${quote.text} (${quote.source})`;
}

export const DAF_YOMI_QUOTES: readonly string[] = QUOTES.map(formatQuote);

export function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * DAF_YOMI_QUOTES.length);
  return DAF_YOMI_QUOTES[randomIndex];
}

export function getRandomQuoteItem(): DafYomiQuote {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];
}

export function getDailyQuote(date: Date = new Date()): DafYomiQuote {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const positiveDay = Math.abs(dayOfYear);
  return QUOTES[positiveDay % QUOTES.length];
}

export function getQuotesByCategory(
  category: QuoteCategory
): readonly DafYomiQuote[] {
  return QUOTES.filter((quote) => quote.category === category);
}
