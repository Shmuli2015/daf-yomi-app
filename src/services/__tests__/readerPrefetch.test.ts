import {
  clearReaderPrefetchInFlight,
  prefetchNextDaf,
} from '../readerPrefetch';
import { fetchSefariaPageText } from '../sefariaTextApi';
import { fetchChavrutaAmud, hasCachedChavrutaMasechet } from '../chavrutaApi';
import { getChavrutaSource } from '../../data/chavrutaSources';

jest.mock('../sefariaTextApi', () => ({
  fetchSefariaPageText: jest.fn(),
}));

jest.mock('../chavrutaApi', () => ({
  fetchChavrutaAmud: jest.fn(),
  hasCachedChavrutaMasechet: jest.fn(),
}));

jest.mock('../../data/chavrutaSources', () => ({
  getChavrutaSource: jest.fn(),
}));

describe('readerPrefetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearReaderPrefetchInFlight();
    (getChavrutaSource as jest.Mock).mockReturnValue(null);
    (fetchSefariaPageText as jest.Mock).mockResolvedValue({ segments: [] });
    (fetchChavrutaAmud as jest.Mock).mockResolvedValue({});
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(false);
  });

  it('prefetches sefaria pages for adjacent amud and the next daf', async () => {
    await prefetchNextDaf(
      { masechetEn: 'Berachot', dafNum: 2, amud: 'a' },
      { gemaraNikud: true, includeChavruta: false },
    );

    expect(fetchSefariaPageText).toHaveBeenCalledTimes(3);
    expect(fetchSefariaPageText).toHaveBeenCalledWith(
      'Berachot',
      2,
      'b',
      true,
      { requireDiskCache: true },
    );
    expect(fetchSefariaPageText).toHaveBeenCalledWith(
      'Berachot',
      3,
      'a',
      true,
      { requireDiskCache: true },
    );
    expect(fetchSefariaPageText).toHaveBeenCalledWith(
      'Berachot',
      3,
      'b',
      true,
      { requireDiskCache: true },
    );
  });

  it('prefetches chavruta for the current masechet when available and not yet cached', async () => {
    (getChavrutaSource as jest.Mock).mockImplementation((masechetEn: string) =>
      masechetEn === 'Berachot' ? { masechetEn, fileId: 'f_1' } : null,
    );
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(false);

    await prefetchNextDaf(
      { masechetEn: 'Berachot', dafNum: 2, amud: 'b' },
      { gemaraNikud: false, includeChavruta: true },
    );

    expect(fetchChavrutaAmud).toHaveBeenCalledTimes(1);
    expect(fetchChavrutaAmud).toHaveBeenCalledWith('Berachot', 2, 'b');
  });

  it('starts chavruta prefetch without waiting for sefaria pages', async () => {
    let releaseSefaria!: () => void;
    const sefariaGate = new Promise<void>((resolve) => {
      releaseSefaria = resolve;
    });
    (fetchSefariaPageText as jest.Mock).mockReturnValue(sefariaGate);
    (getChavrutaSource as jest.Mock).mockImplementation((masechetEn: string) =>
      masechetEn === 'Berachot' ? { masechetEn, fileId: 'f_1' } : null,
    );

    const prefetchPromise = prefetchNextDaf(
      { masechetEn: 'Berachot', dafNum: 2, amud: 'a' },
      { includeChavruta: true },
    );

    for (let i = 0; i < 20 && (fetchChavrutaAmud as jest.Mock).mock.calls.length === 0; i += 1) {
      await Promise.resolve();
    }
    expect(fetchChavrutaAmud).toHaveBeenCalledWith('Berachot', 2, 'a');

    releaseSefaria();
    await prefetchPromise;
  });

  it('prefetches current chavruta masechet even when there is no next daf', async () => {
    (getChavrutaSource as jest.Mock).mockImplementation((masechetEn: string) =>
      masechetEn === 'Niddah' ? { masechetEn, fileId: 'f_1' } : null,
    );

    await prefetchNextDaf(
      { masechetEn: 'Niddah', dafNum: 73, amud: 'a' },
      { includeChavruta: true },
    );

    expect(fetchSefariaPageText).not.toHaveBeenCalled();
    expect(fetchChavrutaAmud).toHaveBeenCalledWith('Niddah', 73, 'a');
  });

  it('skips chavruta download when tractate is already cached', async () => {
    (getChavrutaSource as jest.Mock).mockReturnValue({ masechetEn: 'Berachot', fileId: 'f_1' });
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(true);

    await prefetchNextDaf(
      { masechetEn: 'Berachot', dafNum: 2, amud: 'b' },
      { includeChavruta: true },
    );

    expect(fetchChavrutaAmud).not.toHaveBeenCalled();
  });

  it('handles network errors gracefully without rejecting', async () => {
    (fetchSefariaPageText as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getChavrutaSource as jest.Mock).mockReturnValue({ masechetEn: 'Berachot', fileId: 'f_1' });
    (fetchChavrutaAmud as jest.Mock).mockRejectedValue(new Error('Chavruta failed'));

    await expect(
      prefetchNextDaf({ masechetEn: 'Berachot', dafNum: 2, amud: 'a' }),
    ).resolves.toBeUndefined();
  });
});
