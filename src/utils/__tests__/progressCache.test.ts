import { buildProgressCache, invalidateProgressCache } from '../progressCache';
import type { DailyRecord, PersonalTrackRecord } from '../../db/database';

describe('progressCache utils', () => {
  beforeEach(() => {
    invalidateProgressCache();
  });

  it('calculates 0 learned when history and personal records are empty', () => {
    const cache = buildProgressCache([], []);
    expect(cache.totalShasProgress.learnedCount).toBe(0);
    expect(cache.totalShasProgress.percentage).toBe(0);
    expect(cache.totalShasProgress.totalPages).toBe(2711);
  });

  it('includes personal track records in total Shas progress and masechet progress', () => {
    const personalRecords: PersonalTrackRecord[] = [
      { masechet: 'Berakhot', daf_num: 2, status: 'learned', learnedAt: '2026-01-01' },
      { masechet: 'Berakhot', daf_num: 3, status: 'learned', learnedAt: '2026-01-02' },
      { masechet: 'Bava_Batra', daf_num: 10, status: 'learned', learnedAt: '2026-01-03' },
    ];

    const cache = buildProgressCache([], personalRecords);

    expect(cache.totalShasProgress.learnedCount).toBe(3);
    expect(cache.totalShasProgress.personalCount).toBe(3);
    expect(cache.totalShasProgress.dafYomiCount).toBe(0);

    const berakhot = cache.masechetProgress.get('ברכות');
    expect(berakhot).toBeDefined();
    expect(berakhot?.learned).toBe(2);
    expect(berakhot?.personalLearned).toBe(2);

    const bavaBatra = cache.masechetProgress.get('בבא בתרא');
    expect(bavaBatra).toBeDefined();
    expect(bavaBatra?.learned).toBe(1);
    expect(bavaBatra?.personalLearned).toBe(1);
  });

  it('does not double count a daf learned in both Daf Yomi and Personal Track', () => {
    const history: DailyRecord[] = [
      {
        id: 1,
        date: '2020-01-05',
        masechet: 'ברכות',
        daf: 'דף ב',
        status: 'learned',
        percentage: 100,
        amud: null,
        learnedAt: '2020-01-05T10:00:00Z',
      },
    ];

    const personalRecords: PersonalTrackRecord[] = [
      { masechet: 'Berakhot', daf_num: 2, status: 'learned', learnedAt: '2026-01-01' },
      { masechet: 'Berakhot', daf_num: 3, status: 'learned', learnedAt: '2026-01-02' },
    ];

    const cache = buildProgressCache(history, personalRecords);

    expect(cache.totalShasProgress.learnedCount).toBe(2);
    expect(cache.totalShasProgress.dafYomiCount).toBe(1);
    expect(cache.totalShasProgress.personalCount).toBe(2);

    const berakhot = cache.masechetProgress.get('ברכות');
    expect(berakhot?.learned).toBe(2);
    expect(berakhot?.dafYomiLearned).toBe(1);
    expect(berakhot?.personalLearned).toBe(2);
  });
});
