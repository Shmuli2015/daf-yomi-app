import { emphasizeChavrutaFootnote } from '../chavrutaFootnoteEmphasis';
import { findChavrutaAmud, parseChavrutaDocument } from '../parseChavrutaHtml';

describe('emphasizeChavrutaFootnote', () => {
  it('highlights mefarshim names and quoted pesukim in a Shekalim-style note', () => {
    const text =
      'תוספות בקידושין כתבו וכן פירשו רש"י והריטב"א כדכתיב בקרא "תכין לך הדרך" אך הרמב"ם הביא הלכה זו';

    expect(emphasizeChavrutaFootnote(text)).toBe(
      '**תוספות** בקידושין כתבו וכן פירשו **רש"י** **והריטב"א** כדכתיב בקרא "**תכין לך הדרך**" אך **הרמב"ם** הביא הלכה זו',
    );
  });

  it('does not re-wrap names that are already marked from Berachot HTML', () => {
    const text = '**הריטב"א** [ריש מגילה] מפרש לשון **קורין**.';
    expect(emphasizeChavrutaFootnote(text)).toBe(text);
  });

  it('applies dibur hamatchil on unmarked dash lemmas', () => {
    expect(emphasizeChavrutaFootnote('מאימתי קורין – משעה שהכהנים')).toBe(
      '**מאימתי קורין** – משעה שהכהנים',
    );
  });

  it('does not wrap Niddah 35b note 107 commentary around marked names', () => {
    const html = `
      <u>דף לה - ב</u>
      <span style='font-size:17px; line-height: 140%; color:RGB(0,0,0);'>זוב <nobr><b style='background-color:RGB(216,216,216); font-size:10px; font-family:arial; color:RGB(0,0,0)'>&nbsp;107&nbsp;</b></nobr></span>
      <span style='color:RGB(51,119,204); font-size:14px;'> <nobr><b style='background-color:RGB(51,119,204);  color:white; font-size:10px; font-family:arial;'>&nbsp;107.&nbsp;</b></nobr> כך פירש"י, <b>והרמב"ם</b> [שם] נקט דהיינו כהה, ולכן כתב ש"דוהה כלובן ביצה המוזרת". וראה <b>בפיה"מ לזבים</b> [ב א] שהוא נוטה לאדמימות קצת. <b>ובתוי"ט</b> שם ביאר דבריו. <b>והגר"א</b> בתוספתא [ריש פ"ב בזבים] גרס "דומה" ללובן ביצה המוזרת.</span>
    `;
    const note = findChavrutaAmud(parseChavrutaDocument(html), 35, 'b')?.footnotes.find(
      (footnote) => footnote.n === 107,
    );

    expect(emphasizeChavrutaFootnote(note?.text ?? '')).toBe(
      'כך פירש"י, **והרמב"ם** [שם] נקט דהיינו כהה, ולכן כתב ש"דוהה כלובן ביצה המוזרת". וראה **בפיה"מ לזבים** [ב א] שהוא נוטה לאדמימות קצת. **ובתוי"ט** שם ביאר דבריו. **והגר"א** בתוספתא [ריש פ"ב בזבים] גרס "דומה" ללובן ביצה המוזרת.',
    );
  });

  it('does not wrap a long unmarked dash span as dibur', () => {
    const text =
      'כך פירש"י והרמב"ם נקט דהיינו כהה ולכן כתב שדוהה כלובן ביצה המוזרת - וראה בתוספתא גרסה אחרת';

    expect(emphasizeChavrutaFootnote(text)).toBe(
      'כך פירש"י **והרמב"ם** נקט דהיינו כהה ולכן כתב שדוהה כלובן ביצה המוזרת - וראה בתוספתא גרסה אחרת',
    );
  });

  it('returns empty string for empty input', () => {
    expect(emphasizeChavrutaFootnote('')).toBe('');
  });
});
