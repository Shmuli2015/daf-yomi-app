import {
  buildChavrutaUrl,
  getChavrutaSource,
  hasChavrutaSource,
} from '../chavrutaSources';

describe('chavrutaSources', () => {
  it('maps Berachot to the Torat Emet file with notes', () => {
    const source = getChavrutaSource('Berachot');
    expect(source?.fileId).toBe('f_02337');
    expect(buildChavrutaUrl(source!)).toBe(
      'https://www.toratemetfreeware.com/online/f_02337.html'
    );
  });

  it('has no Chavruta source for Kinnim and Midot', () => {
    expect(hasChavrutaSource('Kinnim')).toBe(false);
    expect(hasChavrutaSource('Midot')).toBe(false);
    expect(getChavrutaSource('Kinnim')).toBeNull();
  });

  it('does not keep a separate without-notes file id', () => {
    const source = getChavrutaSource('Berachot');
    expect(source).toEqual({ masechetEn: 'Berachot', fileId: 'f_02337' });
  });
});
