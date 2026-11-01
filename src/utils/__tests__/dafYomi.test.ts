import { getDateStr, getDafByDate } from '../dafYomi';

describe('dafYomi utils', () => {
  describe('getDateStr', () => {
    it('formats a date as YYYY-MM-DD', () => {
      const date = new Date(2025, 4, 9);
      expect(getDateStr(date)).toBe('2025-05-09');
    });

    it('pads single-digit month and day with zeros', () => {
      const date = new Date(2024, 0, 5);
      expect(getDateStr(date)).toBe('2024-01-05');
    });
  });

  describe('getDafByDate', () => {
    it('calculates the correct Daf Yomi for a known date', () => {
      const date = new Date(2024, 0, 1, 12, 0, 0);
      const res = getDafByDate(date);

      expect(res).toBeDefined();
      expect(res.masechet).toBeTruthy();
      expect(res.daf).toContain('דף');
      expect(res.dateString).toBe('2024-01-01');
    });

    it('uses the local civil date after UTC midnight', () => {
      const date = new Date(2024, 0, 2, 1, 0, 0);
      const res = getDafByDate(date);

      expect(res.dateString).toBe('2024-01-02');
    });
  });
});
