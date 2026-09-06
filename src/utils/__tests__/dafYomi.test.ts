import { getDateStr, getUTCDateStr, getDafByDate } from '../dafYomi';

describe('dafYomi utils', () => {
  describe('getDateStr', () => {
    it('formats a date as YYYY-MM-DD', () => {
      const date = new Date(2025, 4, 9); // May 9, 2025
      expect(getDateStr(date)).toBe('2025-05-09');
    });

    it('pads single-digit month and day with zeros', () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      expect(getDateStr(date)).toBe('2024-01-05');
    });
  });

  describe('getUTCDateStr', () => {
    it('formats UTC date correctly', () => {
      const date = new Date(Date.UTC(2026, 8, 6)); // Sep 6, 2026
      expect(getUTCDateStr(date)).toBe('2026-09-06');
    });
  });

  describe('getDafByDate', () => {
    it('calculates the correct Daf Yomi for a known date', () => {
      // Jan 1, 2024 was Bava Kamma 63
      const date = new Date(2024, 0, 1, 12, 0, 0);
      const res = getDafByDate(date);

      expect(res).toBeDefined();
      expect(res.masechet).toBeTruthy();
      expect(res.daf).toContain('דף');
      expect(res.sefariaUrl).toContain('sefaria.org');
      expect(res.dateString).toBe('2024-01-01');
    });
  });
});
