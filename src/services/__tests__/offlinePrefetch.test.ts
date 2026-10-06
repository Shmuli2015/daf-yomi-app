import {
  buildMasechetAmudTargets,
  buildOfflinePrefetchAmudTargets,
  buildOfflinePrefetchChavrutaTargets,
  getOfflineMasechetStatus,
  getOfflinePrefetchStatus,
  OFFLINE_PREFETCH_DAY_COUNT,
  prefetchOfflineDays,
  prefetchOfflineMasechet,
} from '../offlinePrefetch';
import { fetchSefariaPageText, hasCachedSefariaPageText } from '../sefariaTextApi';
import { fetchChavrutaAmud, hasCachedChavrutaMasechet } from '../chavrutaApi';
import { getChavrutaSource } from '../../data/chavrutaSources';

jest.mock('../sefariaTextApi', () => ({
  fetchSefariaPageText: jest.fn(),
  hasCachedSefariaPageText: jest.fn(),
}));

jest.mock('../chavrutaApi', () => ({
  fetchChavrutaAmud: jest.fn(),
  hasCachedChavrutaMasechet: jest.fn(),
}));

jest.mock('../../data/chavrutaSources', () => ({
  getChavrutaSource: jest.fn(),
}));

describe('offlinePrefetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getChavrutaSource as jest.Mock).mockReturnValue(null);
    (fetchSefariaPageText as jest.Mock).mockResolvedValue({ segments: [] });
    (fetchChavrutaAmud as jest.Mock).mockResolvedValue({});
    (hasCachedSefariaPageText as jest.Mock).mockResolvedValue(false);
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(false);
  });

  it('builds seven days of amud targets with both sides when available', () => {
    const targets = buildOfflinePrefetchAmudTargets(
      new Date(2024, 0, 15, 12, 0, 0),
      { daf_day_start_mode: 'midnight' },
      OFFLINE_PREFETCH_DAY_COUNT,
    );

    expect(targets.length).toBeGreaterThanOrEqual(OFFLINE_PREFETCH_DAY_COUNT);
    expect(targets.every((t) => t.amud === 'a' || t.amud === 'b')).toBe(true);

    const keys = new Set(targets.map((t) => `${t.masechetEn}|${t.dafNum}|${t.amud}`));
    expect(keys.size).toBe(targets.length);
  });

  it('builds full masechet amud targets for a small tractate', () => {
    const targets = buildMasechetAmudTargets('Chagigah');
    expect(targets.length).toBeGreaterThan(20);
    expect(targets.every((t) => t.masechetEn === 'Chagigah')).toBe(true);
    expect(targets.some((t) => t.amud === 'a')).toBe(true);
    expect(targets.some((t) => t.amud === 'b')).toBe(true);
  });

  it('collects one chavruta target per masechet with a source', () => {
    (getChavrutaSource as jest.Mock).mockImplementation((masechetEn: string) =>
      masechetEn === 'Berachot' ? { masechetEn, fileId: 'f_1' } : null,
    );

    const amudTargets = [
      { masechetEn: 'Berachot', dafNum: 2, amud: 'a' as const },
      { masechetEn: 'Berachot', dafNum: 2, amud: 'b' as const },
      { masechetEn: 'Shabbat', dafNum: 3, amud: 'a' as const },
    ];

    const chavrutaTargets = buildOfflinePrefetchChavrutaTargets(amudTargets);
    expect(chavrutaTargets).toEqual([{ masechetEn: 'Berachot', dafNum: 2, amud: 'a' }]);
  });

  it('prefetches sefaria pages and reports progress', async () => {
    const onProgress = jest.fn();
    const result = await prefetchOfflineDays({
      dayCount: 1,
      now: new Date(2024, 0, 15, 12, 0, 0),
      dafDaySettings: { daf_day_start_mode: 'midnight' },
      onProgress,
      concurrency: 2,
    });

    expect(fetchSefariaPageText).toHaveBeenCalled();
    expect(result.total).toBeGreaterThan(0);
    expect(result.successCount + result.failureCount).toBe(result.total);
    expect(onProgress).toHaveBeenCalled();
    const lastProgress = onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
    expect(lastProgress.completed).toBe(lastProgress.total);
  });

  it('prefetches a full masechet', async () => {
    const onProgress = jest.fn();
    const result = await prefetchOfflineMasechet('Horayot', {
      onProgress,
      concurrency: 2,
    });

    expect(fetchSefariaPageText).toHaveBeenCalled();
    expect(result.total).toBeGreaterThan(0);
    expect(result.successCount + result.failureCount).toBe(result.total);
  });

  it('stops early when cancelled before starting work', async () => {
    const result = await prefetchOfflineDays({
      dayCount: 1,
      now: new Date(2024, 0, 15, 12, 0, 0),
      dafDaySettings: { daf_day_start_mode: 'midnight' },
      shouldCancel: () => true,
    });

    expect(result.cancelled).toBe(true);
    expect(fetchSefariaPageText).not.toHaveBeenCalled();
  });

  it('warms chavruta when a source exists', async () => {
    (getChavrutaSource as jest.Mock).mockReturnValue({ masechetEn: 'x', fileId: 'f_1' });

    await prefetchOfflineDays({
      dayCount: 1,
      now: new Date(2024, 0, 15, 12, 0, 0),
      dafDaySettings: { daf_day_start_mode: 'midnight' },
      concurrency: 1,
    });

    expect(fetchChavrutaAmud).toHaveBeenCalled();
  });

  it('reports ready status when all targets are cached', async () => {
    (hasCachedSefariaPageText as jest.Mock).mockResolvedValue(true);
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(true);

    const status = await getOfflinePrefetchStatus({
      dayCount: 1,
      now: new Date(2024, 0, 15, 12, 0, 0),
      dafDaySettings: { daf_day_start_mode: 'midnight' },
    });

    expect(status.ready).toBe(true);
    expect(status.label).toBe('הורד');
    expect(status.cachedCount).toBe(status.totalCount);
  });

  it('reports partial status when only some targets are cached', async () => {
    (hasCachedSefariaPageText as jest.Mock).mockResolvedValueOnce(true).mockResolvedValue(false);

    const status = await getOfflinePrefetchStatus({
      dayCount: 1,
      now: new Date(2024, 0, 15, 12, 0, 0),
      dafDaySettings: { daf_day_start_mode: 'midnight' },
    });

    expect(status.ready).toBe(false);
    expect(status.label).toBe('חלקי');
    expect(status.cachedCount).toBeGreaterThan(0);
  });

  it('reports masechet ready status when cached', async () => {
    (hasCachedSefariaPageText as jest.Mock).mockResolvedValue(true);
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(true);

    const status = await getOfflineMasechetStatus('Horayot');
    expect(status.ready).toBe(true);
    expect(status.label).toBe('הורד');
  });
});
