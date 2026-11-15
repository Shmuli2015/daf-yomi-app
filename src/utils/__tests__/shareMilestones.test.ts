import {
  getStreakMilestone,
  getShasMilestone,
  getUpcomingMasechetCopy,
} from '../shareMilestones';

describe('shareMilestones', () => {
  describe('getStreakMilestone', () => {
    it('returns initial stage for low streak', () => {
      const result = getStreakMilestone(3);
      expect(result.badge).toBe('תחילת הדרך');
      expect(result.title).toBe('רצף לימוד יומי');
    });

    it('returns week milestone for 7-13 days', () => {
      const result = getStreakMilestone(7);
      expect(result.badge).toBe('שבוע של התמדה');
    });

    it('returns two weeks milestone for 14-29 days', () => {
      const result = getStreakMilestone(21);
      expect(result.badge).toBe('שבועיים של רצף');
    });

    it('returns month milestone for 30-49 days', () => {
      const result = getStreakMilestone(35);
      expect(result.badge).toBe('חודש רצוף בתורה');
    });

    it('returns jubilee milestone for 50-99 days', () => {
      const result = getStreakMilestone(60);
      expect(result.badge).toBe('יובל ימי לימוד');
    });

    it('returns 100 days milestone for 100-364 days', () => {
      const result = getStreakMilestone(120);
      expect(result.badge).toBe('מאה ימי עיון');
    });

    it('returns full year milestone for 365+ days', () => {
      const result = getStreakMilestone(400);
      expect(result.badge).toBe('שנה תמימה של דף יומי');
    });
  });

  describe('getShasMilestone', () => {
    it('returns early stage for < 10 percent', () => {
      const result = getShasMilestone(5);
      expect(result.badge).toBe('פסיעות ראשונות');
    });

    it('returns one-tenth milestone for 10-24 percent', () => {
      const result = getShasMilestone(18);
      expect(result.badge).toBe('עשירית הש״ס');
    });

    it('returns quarter milestone for 25-49 percent', () => {
      const result = getShasMilestone(30);
      expect(result.badge).toBe('רבע ש״ס הושלם');
    });

    it('returns half milestone for 50-74 percent', () => {
      const result = getShasMilestone(60);
      expect(result.badge).toBe('חצי ש״ס בידיי');
    });

    it('returns final stretch milestone for 75-99 percent', () => {
      const result = getShasMilestone(85);
      expect(result.badge).toBe('בדרך לסיום הש״ס');
    });

    it('returns full completion milestone for 100 percent', () => {
      const result = getShasMilestone(100);
      expect(result.badge).toBe('סיום הש״ס כולו');
    });
  });

  describe('getUpcomingMasechetCopy', () => {
    it('returns today copy when daysLeft is 0', () => {
      const result = getUpcomingMasechetCopy('ברכות', 0);
      expect(result.badge).toBe('היום מתחילים!');
      expect(result.headline).toContain('היום מתחילים מסכת ברכות');
    });

    it('returns tomorrow copy when daysLeft is 1', () => {
      const result = getUpcomingMasechetCopy('שבת', 1);
      expect(result.badge).toBe('מחר מתחילים!');
      expect(result.headline).toContain('מחר מתחילים מסכת שבת');
    });

    it('returns countdown copy for multiple days left', () => {
      const result = getUpcomingMasechetCopy('עירובין', 4);
      expect(result.badge).toBe('עוד 4 ימים מתחילים');
      expect(result.headline).toContain('מתחילים מסכת עירובין');
    });
  });
});
