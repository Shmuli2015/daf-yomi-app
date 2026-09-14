import { pickFilesToEvict } from '../tzuratHadafCacheEviction';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/user/0/com.shmuli.dafyomi/files/',
  cacheDirectory: 'file:///data/user/0/com.shmuli.dafyomi/cache/',
  getInfoAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

describe('pickFilesToEvict', () => {
  it('returns nothing when under the cap', () => {
    const files = [
      { path: 'a.pdf', size: 10, lastUsedMs: 1 },
      { path: 'b.pdf', size: 20, lastUsedMs: 2 },
    ];
    expect(pickFilesToEvict(files, 100)).toEqual([]);
  });

  it('returns nothing for an empty list', () => {
    expect(pickFilesToEvict([], 100)).toEqual([]);
  });

  it('evicts oldest files first until under the cap', () => {
    const files = [
      { path: 'old.pdf', size: 60, lastUsedMs: 1 },
      { path: 'mid.pdf', size: 60, lastUsedMs: 2 },
      { path: 'new.pdf', size: 60, lastUsedMs: 3 },
    ];
    expect(pickFilesToEvict(files, 100)).toEqual(['old.pdf', 'mid.pdf']);
  });

  it('does not evict keepPath even if it is oldest', () => {
    const files = [
      { path: 'keep.pdf', size: 40, lastUsedMs: 1 },
      { path: 'old.pdf', size: 80, lastUsedMs: 2 },
    ];
    expect(pickFilesToEvict(files, 100, 'keep.pdf')).toEqual(['old.pdf']);
  });

  it('treats missing lastUsed as oldest via zero timestamps', () => {
    const files = [
      { path: 'unknown.pdf', size: 80, lastUsedMs: 0 },
      { path: 'known.pdf', size: 80, lastUsedMs: 9 },
    ];
    expect(pickFilesToEvict(files, 100)).toEqual(['unknown.pdf']);
  });

  it('stops when only keepPath remains even if still over the cap', () => {
    const files = [{ path: 'huge.pdf', size: 200, lastUsedMs: 1 }];
    expect(pickFilesToEvict(files, 100, 'huge.pdf')).toEqual([]);
  });
});
