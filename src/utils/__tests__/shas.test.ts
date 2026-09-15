import { stripNiqqud, getMasechetDafim, getDafDateStr, getReaderDafim, isAmudAvailable } from '../shas';

describe('shas utils', () => {
  describe('stripNiqqud', () => {
    it('removes niqqud from Hebrew text', () => {
      const withNiqqud = 'בְּרָכוֹת';
      expect(stripNiqqud(withNiqqud)).toBe('ברכות');
    });

    it('leaves plain Hebrew text unchanged', () => {
      const plain = 'שבת';
      expect(stripNiqqud(plain)).toBe('שבת');
    });
  });

  describe('getMasechetDafim', () => {
    it('returns an array of daf numbers for a valid masechet', () => {
      const dafim = getMasechetDafim('ברכות');
      expect(Array.isArray(dafim)).toBe(true);
      expect(dafim.length).toBeGreaterThan(0);
      expect(dafim[0]).toBe(2);
    });

    it('works regardless of niqqud in input', () => {
      const dafimWithNiqqud = getMasechetDafim('בְּרָכוֹת');
      const dafimWithout = getMasechetDafim('ברכות');
      expect(dafimWithNiqqud).toEqual(dafimWithout);
    });

    it('includes daf 64 as the last daf of Berachot', () => {
      const dafim = getMasechetDafim('ברכות');
      expect(dafim[dafim.length - 1]).toBe(64);
      expect(dafim.includes(64)).toBe(true);
      expect(dafim.length).toBe(63);
    });

    it('works when passed an English masechet name', () => {
      const dafim = getMasechetDafim('Berachot');
      expect(dafim[dafim.length - 1]).toBe(64);
      expect(dafim.includes(64)).toBe(true);
    });
  });

  describe('getDafDateStr', () => {
    it('returns a date string for a known daf', () => {
      const dateStr = getDafDateStr('ברכות', 2);
      expect(typeof dateStr === 'string' || dateStr === null).toBe(true);
      if (dateStr) {
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('returns a date string for Berachot 64', () => {
      const dateStr = getDafDateStr('ברכות', 64);
      expect(dateStr).toBe('2020-03-07');
    });

    it('maps Tamid 25 to the Kinnim 25 calendar date', () => {
      expect(getDafDateStr('תמיד', 25)).toBe(getDafDateStr('קינים', 25));
      expect(getDafDateStr('קינים', 25)).toBe('2027-03-15');
    });
  });

  describe('getReaderDafim and isAmudAvailable', () => {
    it('keeps Tamid calendar dafim at 26-33 and adds 25 only for the reader', () => {
      expect(getMasechetDafim('תמיד')).toEqual([26, 27, 28, 29, 30, 31, 32, 33]);
      expect(getReaderDafim('תמיד')[0]).toBe(25);
      expect(getReaderDafim('Tamid')[0]).toBe(25);
      expect(getMasechetDafim('קינים')).toEqual([23, 24, 25]);
      expect(getReaderDafim('קינים')).toEqual([23, 24, 25]);
    });

    it('allows only amud b on Tamid 25', () => {
      expect(isAmudAvailable('Tamid', 25, 'a')).toBe(false);
      expect(isAmudAvailable('Tamid', 25, 'b')).toBe(true);
      expect(isAmudAvailable('Kinnim', 25, 'a')).toBe(true);
      expect(isAmudAvailable('Kinnim', 25, 'b')).toBe(true);
    });
  });
});
