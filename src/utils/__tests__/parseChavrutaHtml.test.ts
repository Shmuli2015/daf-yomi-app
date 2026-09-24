import {
  buildAmudKey,
  buildFootnoteToken,
  findChavrutaAmud,
  gematriaToNumber,
  parseChavrutaBodyParts,
  parseChavrutaDocument,
} from '../parseChavrutaHtml';

function bodySpan(inner: string): string {
  return `<span style='font-size:17px; line-height: 140%; color:RGB(0,0,0);'>${inner}</span>`;
}

function noteSpan(inner: string): string {
  return `<span style='color:RGB(51,119,204); font-size:14px;'>${inner}</span>`;
}

function gemara(text: string): string {
  return `<b style='font-size:20px; color:RGB(0,0,0);'>${text}</b>`;
}

function bodyRef(n: number): string {
  return `<nobr><b style='background-color:RGB(216,216,216); font-size:10px; font-family:arial; color:RGB(0,0,0)'>&nbsp;${n}&nbsp;</b></nobr>`;
}

function noteMarker(n: number): string {
  return `<nobr><b style='background-color:RGB(51,119,204);  color:white; font-size:10px; font-family:arial;'>&nbsp;${n}.&nbsp;</b></nobr>`;
}

const FIXTURE = `
  <div>תוכן עניינים</div>
  ${bodySpan('לא שייך לעמוד')}
  <u>דף ב - א</u>
  ${bodySpan(`${gemara('מאימתי קורין')} את שמע${bodyRef(1)} ${gemara('בערבית?')}`)}
  ${noteSpan(`${noteMarker(1)} <b>הריטב״א</b> מפרש לשון ${gemara('קורין')}.`)}
  ${bodySpan('משעה שהכהנים נכנסים לאכול בתרומתן.')}
  <u>דף ב - ב</u>
  ${bodySpan(`מכדי כהנים אימת קא אכלי בתרומה${bodyRef(2)}.`)}
  ${noteSpan(`${noteMarker(2)} צאת הכוכבים.`)}
  <u>דף טו - א</u>
  ${bodySpan('היה קורא בתורה והגיע זמן המקרא.')}
`;

describe('gematriaToNumber', () => {
  it('converts simple and compound Hebrew letters', () => {
    expect(gematriaToNumber('ב')).toBe(2);
    expect(gematriaToNumber('טו')).toBe(15);
    expect(gematriaToNumber('טז')).toBe(16);
    expect(gematriaToNumber('יא')).toBe(11);
    expect(gematriaToNumber('סד')).toBe(64);
  });

  it('ignores gershayim and quotes', () => {
    expect(gematriaToNumber('ט"ו')).toBe(15);
    expect(gematriaToNumber("ב'")).toBe(2);
  });
});

describe('parseChavrutaDocument', () => {
  const amudim = parseChavrutaDocument(FIXTURE);

  it('splits the document by daf and amud headings', () => {
    expect(amudim.map((item) => buildAmudKey(item.dafNum, item.amud))).toEqual([
      '2a',
      '2b',
      '15a',
    ]);
  });

  it('does not keep table-of-contents text that appears before the first daf', () => {
    const amudA = findChavrutaAmud(amudim, 2, 'a');
    expect(amudA?.paragraphs.some((paragraph) => paragraph.text.includes('לא שייך לעמוד'))).toBe(
      false,
    );
  });

  it('keeps inline footnote tokens at the reference point', () => {
    const amudA = findChavrutaAmud(amudim, 2, 'a');
    expect(amudA?.paragraphs[0].text).toBe(
      `**מאימתי קורין** את שמע${buildFootnoteToken(1)} **בערבית?**`
    );
  });

  it('marks gemara lemmas from bold tags', () => {
    const amudA = findChavrutaAmud(amudim, 2, 'a');
    expect(amudA?.paragraphs[0].text).toContain('**מאימתי קורין**');
    expect(amudA?.paragraphs[0].text).toContain('**בערבית?**');
  });

  it('links footnote refs to parsed notes and hides them when unused', () => {
    const amudA = findChavrutaAmud(amudim, 2, 'a');
    expect(amudA?.paragraphs[0].footnoteRefs).toHaveLength(1);
    const footnoteId = amudA?.paragraphs[0].footnoteRefs[0];
    const note = amudA?.footnotes.find((item) => item.id === footnoteId);
    expect(note?.n).toBe(1);
    expect(note?.text).toContain('**הריטב״א**');
    expect(note?.text).toContain('**קורין**');
    expect(amudA?.paragraphs[1].footnoteRefs).toEqual([]);
  });

  it('parses the following amud separately', () => {
    const amudB = findChavrutaAmud(amudim, 2, 'b');
    expect(amudB?.paragraphs[0].text).toContain('כהנים');
    expect(amudB?.paragraphs[0].text).toContain(buildFootnoteToken(1));
    expect(amudB?.footnotes[0].text).toContain('צאת הכוכבים');
  });

  it('returns null for an amud that is not in the document', () => {
    expect(findChavrutaAmud(amudim, 2, 'b')?.dafNum).toBe(2);
    expect(findChavrutaAmud(amudim, 3, 'a')).toBeNull();
  });

  it('decodes ndash entities in body text', () => {
    const html = `
      <u>דף ב - א</u>
      ${bodySpan('דיבור &ndash; פירוש')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.paragraphs[0].text).toBe('דיבור – פירוש');
  });

  it('classifies spans with looser CSS fingerprints', () => {
    const html = `
      <u>דף ב - א</u>
      <span style="font-size: 18px; color:RGB(0,0,0);">גוף הביאור</span>
      <span style="color: rgb(51, 119, 204); font-size: 13px;">${noteMarker(1)} הערה כחולה</span>
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.paragraphs[0].text).toBe('גוף הביאור');
    expect(parsed[0]?.footnotes[0].text).toContain('הערה כחולה');
  });

  it('places a chapter heading before the first daf on that amud', () => {
    const html = `
      <u>פרק ראשון - מאימתי</u>
      <u>דף ב - א</u>
      ${bodySpan('מאימתי קורין.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks[0]).toEqual({
      kind: 'chapterStart',
      titleHe: 'פרק ראשון - מאימתי',
    });
    expect(parsed[0]?.paragraphs[0].text).toBe('מאימתי קורין.');
  });

  it('keeps a hakdama and its notes before the first daf', () => {
    const html = `
      <u>פרק ראשון - מאימתי</u>
      <u>הקדמה</u>
      ${bodySpan(`אמר הכתוב בפרשת שמע${bodyRef(1)}.`)}
      ${noteSpan(`${noteMarker(1)} להלן נחלקו האמוראים.`)}
      <u>דף ב - א</u>
      ${bodySpan(`${gemara('מאימתי קורין')} את שמע.`)}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks.map((block) => (block.kind === 'paragraph' ? block.text : block.titleHe))).toEqual([
      'פרק ראשון - מאימתי',
      'הקדמה',
      `אמר הכתוב בפרשת שמע${buildFootnoteToken(1)}.`,
      '**מאימתי קורין** את שמע.',
    ]);
    expect(parsed[0]?.footnotes[0].text).toContain('נחלקו האמוראים');
  });

  it('keeps intro paragraphs after a chapter heading before the first daf', () => {
    const html = `
      <u>פרק ראשון - באחד באדר</u>
      ${bodySpan('כתב ספר החינוך מצוה קה.')}
      <u>דף ב - א</u>
      ${bodySpan('באחד באדר משמיעין על השקלים.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.paragraphs.map((paragraph) => paragraph.text)).toEqual([
      'כתב ספר החינוך מצוה קה.',
      'באחד באדר משמיעין על השקלים.',
    ]);
  });

  it('ignores table-of-contents body text before BODY_START', () => {
    const html = `
      ${bodySpan('תוכן עניינים לא שייך')}
      <!--BODY_START-->
      <u>פרק ראשון - מאימתי</u>
      <u>הקדמה</u>
      ${bodySpan('פתיחת הביאור.')}
      <u>דף ב - א</u>
      ${bodySpan('מאימתי קורין.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.paragraphs.map((paragraph) => paragraph.text)).toEqual([
      'פתיחת הביאור.',
      'מאימתי קורין.',
    ]);
  });

  it('treats a hakdama heading inside an amud as a section start', () => {
    const html = `
      <u>דף לו - ב</u>
      ${bodySpan('סוף הפרק הקודם.')}
      <u>פרק שלישי - כירה</u>
      <u>הקדמה לפרק "כירה"</u>
      ${bodySpan('פרק כירה עוסק במלאכת מבשל.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks.map((block) => (block.kind === 'paragraph' ? block.text : block.titleHe))).toEqual([
      'סוף הפרק הקודם.',
      'פרק שלישי - כירה',
      'הקדמה לפרק "כירה"',
      'פרק כירה עוסק במלאכת מבשל.',
    ]);
  });

  it('does not keep a leaked hakdama title as a body paragraph', () => {
    const html = `
      <u>דף ב - א</u>
      ${bodySpan('הקדמה')}
      ${bodySpan('אמר הכתוב.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks[0]).toEqual({
      kind: 'chapterStart',
      titleHe: 'הקדמה',
    });
    expect(parsed[0]?.paragraphs.map((paragraph) => paragraph.text)).toEqual(['אמר הכתוב.']);
  });

  it('does not keep a leaked daf heading from the preamble as a body paragraph', () => {
    const html = `
      <u>הקדמה</u>
      ${bodySpan('אמר הכתוב.')}
      ${bodySpan(`<b><u>דף ב - א</u></b>`)}
      ${bodySpan('מאימתי קורין.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.paragraphs.map((paragraph) => paragraph.text)).toEqual([
      'אמר הכתוב.',
      'מאימתי קורין.',
    ]);
  });

  it('keeps a mid-amud chapter change in place and captures hadaran', () => {
    const html = `
      <u>דף יג - א</u>
      ${bodySpan('סוף הפרק הראשון.')}
      <b>הדרן עלך פרק מאימתי</b>
      <u>פרק שני - היה קורא</u>
      ${bodySpan('היה קורא בתורה.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks.map((block) => block.kind)).toEqual([
      'paragraph',
      'chapterEnd',
      'chapterStart',
      'paragraph',
    ]);
    expect(parsed[0]?.blocks[1]).toMatchObject({
      kind: 'chapterEnd',
      titleHe: 'מאימתי',
    });
    expect(parsed[0]?.blocks[2]).toEqual({
      kind: 'chapterStart',
      titleHe: 'פרק שני - היה קורא',
    });
  });

  it('moves a between-amud chapter heading to the next amud and keeps hadaran on the previous one', () => {
    const html = `
      <u>דף יב - ב</u>
      ${bodySpan('סיום פרק ראשון.')}
      <b>הדרן עלך פרק מאימתי</b>
      <u>פרק שני - היה קורא</u>
      <u>דף יג - א</u>
      ${bodySpan('היה קורא בתורה.')}
    `;
    const parsed = parseChavrutaDocument(html);
    const prev = findChavrutaAmud(parsed, 12, 'b');
    const next = findChavrutaAmud(parsed, 13, 'a');

    expect(prev?.blocks.map((block) => block.kind)).toEqual(['paragraph', 'chapterEnd']);
    expect(prev?.blocks[1]).toMatchObject({ kind: 'chapterEnd', titleHe: 'מאימתי' });
    expect(next?.blocks[0]).toEqual({
      kind: 'chapterStart',
      titleHe: 'פרק שני - היה קורא',
    });
    expect(next?.paragraphs[0].text).toBe('היה קורא בתורה.');
  });

  it('does not keep leaked chapter titles as body paragraphs', () => {
    const html = `
      <u>דף ב - א</u>
      ${bodySpan('פרק שני - היה קורא')}
      ${bodySpan('המשך הביאור.')}
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks[0]).toEqual({
      kind: 'chapterStart',
      titleHe: 'פרק שני - היה קורא',
    });
    expect(parsed[0]?.paragraphs.map((paragraph) => paragraph.text)).toEqual(['המשך הביאור.']);
  });

  it('marks the last chapter end as the end of the masechet', () => {
    const html = `
      <u>דף סד - א</u>
      ${bodySpan('סיום המסכת.')}
      <b>הדרן עלך פרק הרואה</b>
      וסליקא לה מסכת ברכות
    `;
    const parsed = parseChavrutaDocument(html);
    expect(parsed[0]?.blocks[1]).toMatchObject({
      kind: 'chapterEnd',
      titleHe: 'הרואה',
      isMasechetEnd: true,
      masechetHe: 'ברכות',
    });
  });

  it('captures matnitin and gemara section headers between paragraphs', () => {
    const html = `
      <u>דף ה - ב</u>
      ${bodySpan('סיום סוגיא קודמת שנעשו כולן בעלי קריין.')}
      <b style='font-size:25px; color:RGB(51,119,204);'>מתניתין:</b>
      ${bodySpan('פרה שילדה כמין חמור פטורה מן הבכורה.')}
      <b style='font-size:25px; color:RGB(51,119,204);'>גמרא:</b>
      ${bodySpan('תנן התם לקמן טז ב.')}
    `;
    const parsed = parseChavrutaDocument(html);
    const amud = findChavrutaAmud(parsed, 5, 'b');

    expect(amud?.blocks.map((block) => block.kind)).toEqual([
      'paragraph',
      'sectionHeader',
      'paragraph',
      'sectionHeader',
      'paragraph',
    ]);
    expect(amud?.blocks[1]).toEqual({
      kind: 'sectionHeader',
      titleHe: 'מתניתין',
    });
    expect(amud?.blocks[3]).toEqual({
      kind: 'sectionHeader',
      titleHe: 'גמרא',
    });
    expect(amud?.paragraphs).toHaveLength(3);
  });
});

describe('parseChavrutaBodyParts', () => {
  it('splits gemara runs and footnote tokens', () => {
    const parts = parseChavrutaBodyParts(
      `**מאימתי קורין** את שמע${buildFootnoteToken(1)} **בערבית?**`
    );
    expect(parts).toEqual([
      { kind: 'text', text: 'מאימתי קורין', isGemara: true },
      { kind: 'text', text: ' את שמע', isGemara: false },
      { kind: 'footnote', id: 1 },
      { kind: 'text', text: ' ', isGemara: false },
      { kind: 'text', text: 'בערבית?', isGemara: true },
    ]);
  });
});
