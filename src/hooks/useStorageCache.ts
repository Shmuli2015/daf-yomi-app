import { useState, useEffect, useCallback } from 'react';
import {
  getStorageUsageSummary,
  clearStorageCache,
  StorageUsageSummary,
} from '../services/storageManager';
import type { SettingsFeedback } from './useSettingsFeedback';

interface UseStorageCacheParams {
  onFeedback?: (feedback: SettingsFeedback) => void;
}

export interface UseStorageCacheReturn {
  storageSummary: StorageUsageSummary | null;
  storageSizeFormatted: string;
  storageSizeBytes: number;
  isCalculating: boolean;
  isClearing: boolean;
  showClearCacheModal: boolean;
  openClearCacheModal: () => void;
  closeClearCacheModal: () => void;
  handleClearCacheConfirm: () => Promise<void>;
  refreshStorageSize: () => Promise<void>;
  executeClearCache: () => Promise<void>;
}

export function useStorageCache({ onFeedback }: UseStorageCacheParams = {}): UseStorageCacheReturn {
  const [storageSummary, setStorageSummary] = useState<StorageUsageSummary | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  const refreshStorageSize = useCallback(async () => {
    setIsCalculating(true);
    try {
      const summary = await getStorageUsageSummary();
      setStorageSummary(summary);
    } catch {
      setStorageSummary({
        totalBytes: 0,
        formattedSize: '0 B',
        sefariaTextBytes: 0,
        chavrutaBytes: 0,
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

  const openClearCacheModal = useCallback(() => setShowClearCacheModal(true), []);
  const closeClearCacheModal = useCallback(() => setShowClearCacheModal(false), []);

  const handleClearCacheConfirm = useCallback(async () => {
    await executeClearCache();
    setShowClearCacheModal(false);
    onFeedback?.({
      title: 'הקבצים השמורים נוקו',
      message: 'כל הטקסטים השמורים נמחקו בהצלחה. סימוני הלימוד וההגדרות שלך נשמרו.',
      iconName: 'checkmark-circle',
      compact: true,
    });
  }, [executeClearCache, onFeedback]);

  useEffect(() => {
    void refreshStorageSize();
  }, [refreshStorageSize]);

  return {
    storageSummary,
    storageSizeFormatted: storageSummary?.formattedSize ?? '...',
    storageSizeBytes: storageSummary?.totalBytes ?? 0,
    isCalculating,
    isClearing,
    showClearCacheModal,
    openClearCacheModal,
    closeClearCacheModal,
    handleClearCacheConfirm,
    refreshStorageSize,
    executeClearCache,
  };
}
