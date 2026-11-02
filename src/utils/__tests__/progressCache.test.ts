jest.mock('../../db/database', () => ({
  getSettings: () => ({ daf_day_start_mode: 'midnight' }),
}));

import { subDays } from 'date-fns';
import { buildProgressCache, updateMasechetProgressInCache, invalidateProgressCache } from '../progressCache';
import type { DailyRecord, PersonalTrackRecord } from '../../db/database';
import { getDateStr } from '../dafYomi';

function dafToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
}

function historyRecord(daysAgo: number, status: DailyRecord['status']): DailyRecord {
  const date = getDateStr(subDays(dafToday(), daysAgo));
  return {
    id: daysAgo + 1,
    date,
    masechet: 'ברכות',
    daf: "דף ב'",
    status,
    percentage: status === 'learned' ? 100 : status === 'partial' ? 50 : 0,
    amud: status === 'partial' ? 'a' : null,
    learnedAt: `${date}T10:00:00.000Z`,
  };
}

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

  it('updateMasechetProgressInCache incrementally matches full buildProgressCache', () => {
    const initialCache = buildProgressCache([], []);
    const personalRecords: PersonalTrackRecord[] = [
      { masechet: 'Berakhot', daf_num: 2, status: 'learned', learnedAt: '2026-01-01' },
      { masechet: 'Berakhot', daf_num: 3, status: 'learned', learnedAt: '2026-01-02' },
    ];

    const updatedCache = updateMasechetProgressInCache(initialCache, 'Berakhot', [], personalRecords);
    const fullCache = buildProgressCache([], personalRecords);

    expect(updatedCache.totalShasProgress.learnedCount).toBe(fullCache.totalShasProgress.learnedCount);
    expect(updatedCache.totalShasProgress.percentage).toBe(fullCache.totalShasProgress.percentage);
    expect(updatedCache.masechetProgress.get('ברכות')?.learned).toBe(fullCache.masechetProgress.get('ברכות')?.learned);
    expect(updatedCache.sederProgress.get('zeraim')?.learnedDafim).toBe(fullCache.sederProgress.get('zeraim')?.learnedDafim);
  });

  describe('streak', () => {
    it('counts consecutive learned days ending yesterday when today is unmarked', () => {
      const cache = buildProgressCache([
        historyRecord(1, 'learned'),
        historyRecord(2, 'learned'),
        historyRecord(3, 'learned'),
      ]);
      expect(cache.streak).toBe(3);
    });

    it('includes today when it is learned', () => {
      const cache = buildProgressCache([
        historyRecord(0, 'learned'),
        historyRecord(1, 'learned'),
        historyRecord(2, 'learned'),
        historyRecord(3, 'learned'),
      ]);
      expect(cache.streak).toBe(4);
    });

    it('resets when yesterday is missed', () => {
      const cache = buildProgressCache([
        historyRecord(1, 'missed'),
        historyRecord(2, 'learned'),
        historyRecord(3, 'learned'),
      ]);
      expect(cache.streak).toBe(0);
    });

    it('does not break the walk on a partial day', () => {
      const cache = buildProgressCache([
        historyRecord(1, 'learned'),
        historyRecord(2, 'partial'),
        historyRecord(3, 'learned'),
      ]);
      expect(cache.streak).toBe(2);
    });

    it('skips today when missed and keeps a streak that ended yesterday', () => {
      const cache = buildProgressCache([
        historyRecord(0, 'missed'),
        historyRecord(1, 'learned'),
        historyRecord(2, 'learned'),
      ]);
      expect(cache.streak).toBe(2);
    });
  });
});
