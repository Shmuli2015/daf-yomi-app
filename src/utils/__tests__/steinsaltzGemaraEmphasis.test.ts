import {
  buildGemaraMatchCorpus,
  emphasizeSteinsaltzFromGemara,
  normalizeHebrewMatchToken,
} from '../steinsaltzGemaraEmphasis';
import { prepareSteinsaltzPlainText } from '../commentaryEmphasis';

describe('normalizeHebrewMatchToken', () => {
  it('strips nikud and expands rabbi abbreviation', () => {
    expect(normalizeHebrewMatchToken('מֵאִיר')).toBe('מאיר');
    expect(normalizeHebrewMatchToken("ר'")).toBe('רבי');
    expect(normalizeHebrewMatchToken('ר׳')).toBe('רבי');
  });
});

describe('emphasizeSteinsaltzFromGemara', () => {
  const gemara = [
    'אבל בהמה דבת מיקדש היא איכא למימר דהכי קאמר אי אמינא לה למרה מזבין לה ניהלי תיקדוש לה מהשתא ואקרבה אבל דמי לא קאמר',
    'יכול לא יהו נערכין תלמוד לומר איש דברי רבי מאיר',
  ];

  it('adds emphasis for unmarked gemara lemmas', () => {
    const input =
      'בשעה שהוא מקדיש אותה: אי אמינא לה למרה מזבין לה ניהלי, תיקדוש לה מהשתא ואקרבה [הואיל ואם אומר]';
    expect(emphasizeSteinsaltzFromGemara(input, gemara)).toBe(
      'בשעה שהוא מקדיש אותה: **אי אמינא לה למרה מזבין לה ניהלי, תיקדוש לה מהשתא ואקרבה** [הואיל ואם אומר]',
    );
  });

  it('keeps existing bold markers and only fills gaps', () => {
    const input = '**אבל** במקדיש **בהמה, דבת מיקדש היא** ואחר כך אי אמינא לה למרה מזבין לה ניהלי תיקדוש לה מהשתא ואקרבה סוף';
    const result = emphasizeSteinsaltzFromGemara(input, gemara);
    expect(result.startsWith('**אבל** במקדיש **בהמה, דבת מיקדש היא**')).toBe(true);
    expect(result).toContain('**אי אמינא לה למרה מזבין לה ניהלי תיקדוש לה מהשתא ואקרבה**');
  });

  it('does not emphasize bracket translations', () => {
    const input = 'טקסט רגיל [אי אמינא לה למרה מזבין לה ניהלי תיקדוש לה מהשתא ואקרבה] המשך';
    expect(emphasizeSteinsaltzFromGemara(input, gemara)).toBe(input);
  });

  it('does not emphasize short phrases under three words', () => {
    const input = 'כאן כתוב אבל בהמה בלבד';
    expect(emphasizeSteinsaltzFromGemara(input, gemara)).toBe(input);
  });

  it('matches ר\' against רבי in gemara', () => {
    const input = 'ולכן אלו דברי ר\' מאיר בסוף';
    expect(emphasizeSteinsaltzFromGemara(input, gemara)).toContain("**דברי ר' מאיר**");
  });

  it('is idempotent', () => {
    const input =
      'בשעה שהוא מקדיש אותה: אי אמינא לה למרה מזבין לה ניהלי, תיקדוש לה מהשתא ואקרבה [תרגום]';
    const once = emphasizeSteinsaltzFromGemara(input, gemara);
    expect(emphasizeSteinsaltzFromGemara(once, gemara)).toBe(once);
  });

  it('returns original text when gemara corpus is empty', () => {
    expect(emphasizeSteinsaltzFromGemara('אי אמינא לה למרה', [])).toBe('אי אמינא לה למרה');
    expect(buildGemaraMatchCorpus([])).toBe('');
  });
});

describe('prepareSteinsaltzPlainText with gemara matching', () => {
  it('fixes digit typos and adds gemara emphasis together', () => {
    const gemara = ['איכא נמי ערך לפחות מבן חודש'];
    expect(
      prepareSteinsaltzPlainText('**איכא נמי** [יש גם כ8ן] ערך לפחות מבן חודש', gemara),
    ).toBe('**איכא נמי** [יש גם כן] **ערך לפחות מבן חודש**');
  });
});
