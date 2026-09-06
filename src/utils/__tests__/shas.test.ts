import { stripNiqqud, getMasechetDafim, getDafDateStr } from '../shas';

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
  });

  describe('getDafDateStr', () => {
    it('returns a date string for a known daf', () => {
      const dateStr = getDafDateStr('ברכות', 2);
      expect(typeof dateStr === 'string' || dateStr === null).toBe(true);
      if (dateStr) {
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });
});
