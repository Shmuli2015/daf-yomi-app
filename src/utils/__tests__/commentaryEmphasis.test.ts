import {
  cleanCommentaryHtml,
  emphasizeGemaraSectionLabels,
  emphasizeRashiDibur,
  parseCommentaryRuns,
  prepareCommentaryText,
  prepareGemaraText,
  stripEmDash,
} from '../commentaryEmphasis';

describe('stripEmDash', () => {
  it('replaces unicode em-dash with hyphen', () => {
    expect(stripEmDash('שלום\u2014עולם')).toBe('שלום-עולם');
  });

  it('replaces html entities and double hyphens', () => {
    expect(stripEmDash('א &mdash; ב &#8212; ג -- ד')).toBe('א - ב - ג - ד');
  });

  it('returns empty string for empty input', () => {
    expect(stripEmDash('')).toBe('');
  });
});

describe('cleanCommentaryHtml', () => {
  it('converts bold tags to emphasis markers and strips other html', () => {
    const html = '<b>מאימתי</b> (ממתי) <i>קורין</i> את שמע';
    expect(cleanCommentaryHtml(html)).toBe('**מאימתי** (ממתי) קורין את שמע');
  });

  it('converts strong and big tags', () => {
    expect(cleanCommentaryHtml('<strong>דיבור</strong> פירוש')).toBe('**דיבור** פירוש');
    expect(cleanCommentaryHtml('<big>דיבור</big> פירוש')).toBe('**דיבור** פירוש');
  });

  it('strips nested tags inside bold', () => {
    expect(cleanCommentaryHtml('<b>foo <i>bar</i></b> baz')).toBe('**foo bar** baz');
  });

  it('keeps nested big and strong mishnah or gemara markers', () => {
    expect(cleanCommentaryHtml('<big><strong>מֵאֵימָתַי</strong></big> קוֹרִין')).toBe(
      '**מֵאֵימָתַי** קוֹרִין',
    );
    expect(cleanCommentaryHtml('<big><strong>גְּמָ׳</strong></big> תַּנָּא')).toBe(
      '**גְּמָ׳** תַּנָּא',
    );
    expect(cleanCommentaryHtml('<strong><big>משנה:</big></strong> אָמַר')).toBe('**משנה:** אָמַר');
    expect(cleanCommentaryHtml('<strong><big>הלכה:</big></strong> רִבִּי')).toBe('**הלכה:** רִבִּי');
  });

  it('returns empty string for empty input', () => {
    expect(cleanCommentaryHtml('')).toBe('');
  });

  it('decodes ndash entities before splitting', () => {
    expect(cleanCommentaryHtml('דיבור &ndash; פירוש')).toBe('דיבור – פירוש');
  });
});

describe('emphasizeGemaraSectionLabels', () => {
  it('wraps matni and gemara labels with nikud and geresh', () => {
    expect(emphasizeGemaraSectionLabels('מַתְנִי׳ שִׁילּוּחַ הַקֵּן נוֹהֵג')).toBe(
      '**מַתְנִי׳** שִׁילּוּחַ הַקֵּן נוֹהֵג',
    );
    expect(emphasizeGemaraSectionLabels("מַתְנִי' שַׁמַּאי אוֹמֵר")).toBe(
      "**מַתְנִי'** שַׁמַּאי אוֹמֵר",
    );
    expect(emphasizeGemaraSectionLabels('גְּמָ׳ רַבִּי אָבִין')).toBe('**גְּמָ׳** רַבִּי אָבִין');
  });

  it('wraps yerushalmi mishnah and halakhah headings', () => {
    expect(emphasizeGemaraSectionLabels('משנה: אָמַר רִבִּי')).toBe('**משנה:** אָמַר רִבִּי');
    expect(emphasizeGemaraSectionLabels('הלכה: רִבִּי יְהוּדָה')).toBe('**הלכה:** רִבִּי יְהוּדָה');
  });

  it('does not wrap gemara inside a longer hebrew word', () => {
    expect(emphasizeGemaraSectionLabels('גמרא זו אינה תווית')).toBe('גמרא זו אינה תווית');
  });
});

describe('prepareGemaraText', () => {
  it('emphasizes matni and leaves the first mishnah words plain', () => {
    const html = 'מַתְנִי׳ <strong><big>שִׁילּוּחַ הַקֵּן</big></strong> נוֹהֵג בָּאָרֶץ';
    expect(prepareGemaraText(html)).toBe('**מַתְנִי׳** שִׁילּוּחַ הַקֵּן נוֹהֵג בָּאָרֶץ');
  });

  it('inserts a matni label when the first mishnah has none', () => {
    expect(prepareGemaraText('<big><strong>מֵאֵימָתַי</strong></big> קוֹרִין אֶת שְׁמַע')).toBe(
      '**מַתְנִי׳** מֵאֵימָתַי קוֹרִין אֶת שְׁמַע',
    );
    expect(prepareGemaraText('<big><strong>מָבוֹי</strong></big> שֶׁהוּא גָּבוֹהַּ')).toBe(
      '**מַתְנִי׳** מָבוֹי שֶׁהוּא גָּבוֹהַּ',
    );
  });

  it('does not insert matni before gemara or hadran headings', () => {
    expect(prepareGemaraText('<strong><big>הֲדַרַן עֲלָךְ רֵאשִׁית הַגֵּז.</big></strong>')).toBe(
      'הֲדַרַן עֲלָךְ רֵאשִׁית הַגֵּז.',
    );
  });

  it('emphasizes tagged gemara labels after stripping html', () => {
    expect(prepareGemaraText('<strong><big>גְּמָ׳</big></strong> רַבִּי אָבִין')).toBe(
      '**גְּמָ׳** רַבִּי אָבִין',
    );
  });
});

describe('emphasizeRashiDibur', () => {
  it('wraps the lemma before an en dash', () => {
    const text = 'עד סוף האשמורה הראשונה – שליש הלילה';
    expect(emphasizeRashiDibur(text)).toBe('**עד סוף האשמורה הראשונה** – שליש הלילה');
  });

  it('wraps the lemma before an ascii hyphen', () => {
    const text = 'עד חצות - סייג עשו חכמים לתורה';
    expect(emphasizeRashiDibur(text)).toBe('**עד חצות** - סייג עשו חכמים לתורה');
  });

  it('prefers the first period as dibur hamatchil when it appears before the dash', () => {
    const text =
      'מאימתי קורין את שמע בערבין. משעה שהכהנים נכנסים לאכול בתרומתן – כהנים שנטמאו';
    expect(emphasizeRashiDibur(text)).toBe(
      '**מאימתי קורין את שמע בערבין.** משעה שהכהנים נכנסים לאכול בתרומתן – כהנים שנטמאו',
    );
  });

  it('does not wrap when bold markers already exist', () => {
    const text = '**דיבור** – פירוש נוסף';
    expect(emphasizeRashiDibur(text)).toBe(text);
  });

  it('applies wrapping per paragraph', () => {
    const text = 'דיבור א – פירוש א\n\nדיבור ב – פירוש ב';
    expect(emphasizeRashiDibur(text)).toBe('**דיבור א** – פירוש א\n\n**דיבור ב** – פירוש ב');
  });

  it('leaves text without a dash unchanged', () => {
    expect(emphasizeRashiDibur('פירוש בלי דיבור')).toBe('פירוש בלי דיבור');
  });
});


describe('prepareCommentaryText', () => {
  it('preserves bold for steinsaltz and skips dash fallback', () => {
    expect(prepareCommentaryText('הקדמה – <b>מאימתי</b> (ממתי)', 'steinsaltz')).toBe(
      'הקדמה – **מאימתי** (ממתי)',
    );
    expect(prepareCommentaryText('הקדמה – הסבר בלי הדגשה', 'steinsaltz')).toBe(
      'הקדמה – הסבר בלי הדגשה',
    );
  });

  it('applies rashi dash fallback when no bold tags exist', () => {
    const html = 'מאימתי קורין את שמע בערבין. – כהנים שנטמאו';
    expect(prepareCommentaryText(html, 'rashi')).toBe(
      '**מאימתי קורין את שמע בערבין.** – כהנים שנטמאו',
    );
  });

  it('applies tosafot dash fallback like rashi', () => {
    const html = 'מאימתי קורין את שמע בערבין. – כהנים שנטמאו';
    expect(prepareCommentaryText(html, 'tosafot')).toBe(
      '**מאימתי קורין את שמע בערבין.** – כהנים שנטמאו',
    );
  });
});

describe('parseCommentaryRuns', () => {
  it('splits gemara markers from commentary text', () => {
    expect(parseCommentaryRuns('**מאימתי** (ממתי) **קורין** את שמע')).toEqual([
      { text: 'מאימתי', isGemara: true },
      { text: ' (ממתי) ', isGemara: false },
      { text: 'קורין', isGemara: true },
      { text: ' את שמע', isGemara: false },
    ]);
  });

  it('keeps mishnah and gemara heading markers as emphasized runs', () => {
    expect(parseCommentaryRuns('**גְּמָ׳** תַּנָּא הֵיכָא קָאֵי')).toEqual([
      { text: 'גְּמָ׳', isGemara: true },
      { text: ' תַּנָּא הֵיכָא קָאֵי', isGemara: false },
    ]);
    expect(parseCommentaryRuns('**משנה:** אָמַר')).toEqual([
      { text: 'משנה:', isGemara: true },
      { text: ' אָמַר', isGemara: false },
    ]);
  });

  it('returns a single plain run when there are no markers', () => {
    expect(parseCommentaryRuns('פירוש רגיל')).toEqual([
      { text: 'פירוש רגיל', isGemara: false },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseCommentaryRuns('')).toEqual([]);
  });
});
