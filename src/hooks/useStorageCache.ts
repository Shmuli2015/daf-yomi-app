import { useState, useEffect, useCallback } from 'react';
import {
  getStorageUsageSummary,
  clearStorageCache,
  StorageUsageSummary,
} from '../services/storageManager';

export interface UseStorageCacheReturn {
  storageSummary: StorageUsageSummary | null;
  storageSizeFormatted: string;
  storageSizeBytes: number;
  isCalculating: boolean;
  isClearing: boolean;
  refreshStorageSize: () => Promise<void>;
  executeClearCache: () => Promise<void>;
}

export function useStorageCache(): UseStorageCacheReturn {
  const [storageSummary, setStorageSummary] = useState<StorageUsageSummary | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const refreshStorageSize = useCallback(async () => {
    setIsCalculating(true);
    try {
      const summary = await getStorageUsageSummary();
      setStorageSummary(summary);
    } catch {
      setStorageSummary({
        totalBytes: 0,
        formattedSize: '0 B',
        tzuratHadafBytes: 0,
        sefariaTextBytes: 0,
        updatesBytes: 0,
      });
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const executeClearCache = useCallback(async () => {
    setIsClearing(true);
    try {
      await clearStorageCache();
      await refreshStorageSize();
    } finally {
      setIsClearing(false);
    }
  }, [refreshStorageSize]);

  useEffect(() => {
    void refreshStorageSize();
  }, [refreshStorageSize]);

  return {
    storageSummary,
    storageSizeFormatted: storageSummary?.formattedSize ?? '...',
    storageSizeBytes: storageSummary?.totalBytes ?? 0,
    isCalculating,
    isClearing,
    refreshStorageSize,
    executeClearCache,
  };
}
