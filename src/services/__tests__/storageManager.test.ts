import {
  formatStorageBytes,
  getStorageUsageSummary,
  clearStorageCache,
} from '../storageManager';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/user/0/com.shmuli.dafyomi/files/',
  cacheDirectory: 'file:///data/user/0/com.shmuli.dafyomi/cache/',
  getInfoAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('storageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatStorageBytes', () => {
    it('returns 0 B for non-positive values', () => {
      expect(formatStorageBytes(0)).toBe('0 B');
      expect(formatStorageBytes(-50)).toBe('0 B');
    });

    it('formats bytes under 1 KB', () => {
      expect(formatStorageBytes(512)).toBe('512 B');
      expect(formatStorageBytes(1023)).toBe('1023 B');
    });

    it('formats kilobytes correctly', () => {
      expect(formatStorageBytes(1024)).toBe('1.0 KB');
      expect(formatStorageBytes(1536)).toBe('1.5 KB');
      expect(formatStorageBytes(500 * 1024)).toBe('500.0 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatStorageBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatStorageBytes(15.5 * 1024 * 1024)).toBe('15.5 MB');
      expect(formatStorageBytes(100 * 1024 * 1024)).toBe('100.0 MB');
    });
  });

  describe('getStorageUsageSummary', () => {
    it('calculates total size across cache directories', async () => {
      const mockGetInfo = FileSystem.getInfoAsync as jest.Mock;
      const mockReadDir = FileSystem.readDirectoryAsync as jest.Mock;

      mockGetInfo.mockImplementation(async (path: string) => {
        if (path.endsWith('.json')) {
          return { exists: true, size: 50000 };
        }
        if (path.endsWith('.apk')) {
          return { exists: true, size: 10000000 };
        }
        return { exists: true, isDirectory: true };
      });

      mockReadDir.mockImplementation(async (path: string) => {
        if (path === 'file:///data/user/0/com.shmuli.dafyomi/files/sefaria-text/') {
          return ['berakhot_2.json'];
        }
        if (path === 'file:///data/user/0/com.shmuli.dafyomi/files/chavruta/') {
          return ['Berachot.json'];
        }
        if (path === 'file:///data/user/0/com.shmuli.dafyomi/cache/updates/') {
          return ['update.apk'];
        }
        return [];
      });

      const summary = await getStorageUsageSummary();
      expect(summary.totalBytes).toBeGreaterThan(0);
      expect(summary.sefariaTextBytes).toBe(50000);
      expect(summary.chavrutaBytes).toBe(50000);
      expect(summary.updatesBytes).toBe(10000000);
      expect(summary.formattedSize).toContain('MB');
    });

    it('handles non-existent directories gracefully', async () => {
      const mockGetInfo = FileSystem.getInfoAsync as jest.Mock;
      mockGetInfo.mockResolvedValue({ exists: false });

      const summary = await getStorageUsageSummary();
      expect(summary.totalBytes).toBe(0);
      expect(summary.formattedSize).toBe('0 B');
    });
  });

  describe('clearStorageCache', () => {
    it('calls deleteAsync on existing directories with idempotent flag', async () => {
      const mockGetInfo = FileSystem.getInfoAsync as jest.Mock;
      const mockDelete = FileSystem.deleteAsync as jest.Mock;

      mockGetInfo.mockResolvedValue({ exists: true });
      mockDelete.mockResolvedValue(undefined);

      await clearStorageCache();
      expect(mockDelete).toHaveBeenCalled();
      expect(mockDelete.mock.calls[0][1]).toEqual({ idempotent: true });
    });
  });
});
