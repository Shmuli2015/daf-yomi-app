import { buildSefariaTref, getNextAmud, getPrevAmud, normalizeMasechetEn } from '../dafNavigation';

describe('buildSefariaTref', () => {
  it('keeps Sefaria refs on Berakhot', () => {
    expect(buildSefariaTref('Berachot', 2, 'a')).toBe('Berakhot.2a');
    expect(buildSefariaTref('Berakhot', 10, 'b')).toBe('Berakhot.10b');
  });

  it('builds Sefaria refs with Sefaria spellings', () => {
    expect(buildSefariaTref('Gitin', 2, 'a')).toBe('Gittin.2a');
    expect(buildSefariaTref('Baba Kamma', 2, 'a')).toBe('Bava_Kamma.2a');
    expect(buildSefariaTref('Rosh Hashana', 2, 'a')).toBe('Rosh_Hashanah.2a');
    expect(buildSefariaTref('Bechorot', 2, 'a')).toBe('Bekhorot.2a');
    expect(buildSefariaTref('Arachin', 2, 'a')).toBe('Arakhin.2a');
    expect(buildSefariaTref('Midot', 34, 'a')).toBe('Middot.34a');
    expect(buildSefariaTref('Kinnim', 23, 'a')).toBe('Kinnim.23a');
    expect(buildSefariaTref('Tamid', 26, 'a')).toBe('Tamid.26a');
    expect(buildSefariaTref('Shekalim', 2, 'a')).toBe('Shekalim.2a');
  });
});

describe('normalizeMasechetEn', () => {
  it('normalizes Sefaria and Hebcal spellings to the Shas name', () => {
    expect(normalizeMasechetEn('Berakhot')).toBe('Berachot');
    expect(normalizeMasechetEn('Gittin')).toBe('Gitin');
  });
});

describe('Kinnim and Tamid 25 navigation', () => {
  it('moves from Kinnim 25a to Kinnim 25b, then to Tamid 26a', () => {
    expect(getNextAmud({ masechetEn: 'Kinnim', dafNum: 25, amud: 'a' })).toEqual({
      masechetEn: 'Kinnim',
      dafNum: 25,
      amud: 'b',
    });
    expect(getNextAmud({ masechetEn: 'Kinnim', dafNum: 25, amud: 'b' })).toEqual({
      masechetEn: 'Tamid',
      dafNum: 26,
      amud: 'a',
    });
    expect(getNextAmud({ masechetEn: 'Tamid', dafNum: 25, amud: 'b' })).toEqual({
      masechetEn: 'Tamid',
      dafNum: 26,
      amud: 'a',
    });
  });

  it('moves back from Tamid 26a to Tamid 25b, then to Kinnim 25a', () => {
    expect(getPrevAmud({ masechetEn: 'Tamid', dafNum: 26, amud: 'a' })).toEqual({
      masechetEn: 'Tamid',
      dafNum: 25,
      amud: 'b',
    });
    expect(getPrevAmud({ masechetEn: 'Tamid', dafNum: 25, amud: 'b' })).toEqual({
      masechetEn: 'Kinnim',
      dafNum: 25,
      amud: 'a',
    });
  });

  it('does not change the Bavli tref builder for Kinnim', () => {
    expect(buildSefariaTref('Kinnim', 23, 'a')).toBe('Kinnim.23a');
  });
});
