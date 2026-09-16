import { shouldShowYesterdayNudge } from '../yesterdayNudge';

describe('shouldShowYesterdayNudge', () => {
  const today = new Date(2026, 8, 16);

  it('shows when yesterday is unmarked and the day before was learned', () => {
    expect(
      shouldShowYesterdayNudge(
        [{ date: '2026-09-14', status: 'learned' }],
        today,
      ),
    ).toBe(true);
  });

  it('hides when yesterday is already learned', () => {
    expect(
      shouldShowYesterdayNudge(
        [
          { date: '2026-09-14', status: 'learned' },
          { date: '2026-09-15', status: 'learned' },
        ],
        today,
      ),
    ).toBe(false);
  });

  it('hides when there is no streak behind yesterday', () => {
    expect(shouldShowYesterdayNudge([], today)).toBe(false);
  });
});
