import {
  classicCommentatorKeysForTref,
  collectCommentariesByKey,
  commentatorFetchSpecs,
  filterCommentaries,
  identifySefariaCommentator,
  type SefariaCommentatorKey,
} from '../sefariaCommentators';

describe('identifySefariaCommentator', () => {
  it('identifies Rashi by collective title', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Rashi', he: 'רש"י' },
      }),
    ).toBe('rashi');
  });

  it('does not treat Otzar Laazei Rashi as Rashi', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: "Otzar La'azei Rashi", he: 'אוצר לעזי רש"י' },
      }),
    ).toBeNull();
  });

  it('does not match Rashi as a substring of another commentator', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Rash MiShantz', he: 'ר"ש משאנץ' },
      }),
    ).toBeNull();
  });

  it('identifies Tosafot', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Tosafot', he: 'תוספות' },
      }),
    ).toBe('tosafot');
  });

  it('does not treat Tosafot Yom Tov as Tosafot', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Tosafot Yom Tov', he: 'תוספות יום טוב' },
      }),
    ).toBeNull();
  });

  it('identifies Steinsaltz', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Steinsaltz', he: 'ביאור שטיינזלץ' },
      }),
    ).toBe('steinsaltz');
  });

  it('identifies Yerushalmi Shekalim commentators', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Korban HaEdah', he: 'קרבן העדה' },
      }),
    ).toBe('korbanHaEdah');
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Penei Moshe', he: 'פני משה' },
      }),
    ).toBe('peneiMoshe');
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Chiddushei Ridbaz', he: 'חידושי רידב״ז' },
      }),
    ).toBe('ridbaz');
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Sheyarei Korban', he: 'שיירי קרבן' },
      }),
    ).toBe('sheyareiKorban');
  });

  it('identifies Bartenura and Rambam on Mishnah', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Bartenura', he: 'ברטנורא' },
      }),
    ).toBe('bartenura');
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Rambam', he: 'רמב״ם' },
      }),
    ).toBe('rambam');
  });

  it('identifies Tamid Vilna commentators', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Mefaresh', he: 'מפרש' },
      }),
    ).toBe('mefaresh');
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Commentary of the Rosh', he: 'פירוש הרא"ש' },
      }),
    ).toBe('rosh');
  });

  it('does not treat Tosafot HaRosh as the Rosh on Tamid', () => {
    expect(
      identifySefariaCommentator({
        collectiveTitle: { en: 'Tosafot HaRosh', he: 'תוספות הרא"ש' },
      }),
    ).toBeNull();
  });
});

describe('classicCommentatorKeysForTref', () => {
  it('returns mishnah commentators for Kinnim and Middot trefs', () => {
    expect(classicCommentatorKeysForTref('Mishnah_Kinnim.1.1-2')).toEqual(['bartenura', 'rambam']);
    expect(classicCommentatorKeysForTref('Mishnah_Middot.4.5-5.4')).toEqual(['bartenura', 'rambam']);
  });

  it('returns Mefaresh and Rosh for Tamid trefs', () => {
    expect(classicCommentatorKeysForTref('Tamid.25b')).toEqual(['mefaresh', 'rosh']);
    expect(classicCommentatorKeysForTref('Tamid.26a')).toEqual(['mefaresh', 'rosh']);
  });
});

describe('commentatorFetchSpecs', () => {
  it('builds Bartenura and Rambam specs for mishnah trefs', () => {
    const specs = commentatorFetchSpecs('Mishnah_Kinnim.3.1-6', false);
    expect(specs.map((spec) => spec.key)).toEqual(['bartenura', 'rambam']);
    expect(specs[0].prefix).toBe('Bartenura_on_Mishnah_Kinnim.3.1-6');
    expect(specs[1].prefix).toBe('Rambam_on_Mishnah_Kinnim.3.1-6');
    expect(specs.every((spec) => spec.mode === 'mishnah')).toBe(true);
  });

  it('builds Mefaresh and Steinsaltz specs for Tamid', () => {
    const specs = commentatorFetchSpecs('Tamid.25b', false);
    expect(specs.map((spec) => spec.key)).toEqual(['mefaresh', 'steinsaltz']);
    expect(specs[0].prefix).toBe('Mefaresh_on_Tamid.25b.1-99');
    expect(specs[0].mode).toBe('bavli');
    expect(specs[1].prefix).toBe('Steinsaltz_on_Tamid.25b');
  });
});

describe('filterCommentaries', () => {
  it('keeps only the requested commentator keys', () => {
    const commentaries: Record<number, Array<{ commentator: SefariaCommentatorKey; he: string }>> = {
      0: [
        { commentator: 'rashi', he: 'רש״י' },
        { commentator: 'steinsaltz', he: 'שטיינזלץ' },
      ],
      1: [{ commentator: 'tosafot', he: 'תוספות' }],
    };

    expect(filterCommentaries(commentaries, ['rashi', 'tosafot'])).toEqual({
      0: [{ commentator: 'rashi', he: 'רש״י' }],
      1: [{ commentator: 'tosafot', he: 'תוספות' }],
    });
  });
});

describe('collectCommentariesByKey', () => {
  it('returns matching comments in index order', () => {
    const commentaries: Record<
      number,
      Array<{ commentator: SefariaCommentatorKey; he: string; ref: string }>
    > = {
      2: [{ commentator: 'steinsaltz', he: 'ג', ref: 'c' }],
      0: [{ commentator: 'steinsaltz', he: 'א', ref: 'a' }],
      1: [{ commentator: 'rashi', he: 'רש״י', ref: 'r' }],
    };

    expect(collectCommentariesByKey(commentaries, 'steinsaltz')).toEqual([
      { commentator: 'steinsaltz', he: 'א', ref: 'a' },
      { commentator: 'steinsaltz', he: 'ג', ref: 'c' },
    ]);
  });
});
