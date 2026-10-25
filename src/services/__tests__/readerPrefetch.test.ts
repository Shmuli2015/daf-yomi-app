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
    expect(fetchSefariaPageText).toHaveBeenNthCalledWith(
      1,
      'Berachot',
      2,
      'b',
      true,
      { requireDiskCache: true },
    );
    expect(fetchSefariaPageText).toHaveBeenNthCalledWith(
      2,
      'Berachot',
      3,
      'a',
      true,
      { requireDiskCache: true },
    );
    expect(fetchSefariaPageText).toHaveBeenNthCalledWith(
      3,
      'Berachot',
      3,
      'b',
      true,
      { requireDiskCache: true },
    );
  });

  it('prefetches chavruta masechet when available and not yet cached', async () => {
    (getChavrutaSource as jest.Mock).mockImplementation((masechetEn: string) =>
      masechetEn === 'Berachot' ? { masechetEn, fileId: 'f_1' } : null,
    );
    (hasCachedChavrutaMasechet as jest.Mock).mockResolvedValue(false);

    await prefetchNextDaf(
      { masechetEn: 'Berachot', dafNum: 2, amud: 'b' },
      { gemaraNikud: false, includeChavruta: true },
    );

    expect(fetchChavrutaAmud).toHaveBeenCalledWith('Berachot', 3, 'a');
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
