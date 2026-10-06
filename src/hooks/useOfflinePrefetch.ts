import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SHAS_MASECHTOT } from '../data/shas';
import {
  getOfflineMasechetStatus,
  getOfflinePrefetchStatus,
  OFFLINE_PREFETCH_DAY_COUNT,
  prefetchOfflineDays,
  prefetchOfflineMasechet,
  type OfflinePrefetchProgress,
  type OfflinePrefetchResult,
  type OfflinePrefetchStatus,
} from '../services/offlinePrefetch';
import { useAppStore } from '../store/useAppStore';
import { getDafDayDate } from '../utils/dafDayBoundary';
import { getDafByDate } from '../utils/dafYomi';
import type { SettingsFeedback } from './useSettingsFeedback';

export type OfflineMasechetTarget = {
  masechetEn: string;
  masechetHe: string;
  status: OfflinePrefetchStatus | null;
};

interface UseOfflinePrefetchParams {
  onFeedback?: (feedback: SettingsFeedback) => void;
  onCompleted?: () => void;
}

export interface UseOfflinePrefetchReturn {
  isPrefetching: boolean;
  prefetchProgress: OfflinePrefetchProgress | null;
  activeTargetLabel: string | null;
  daysStatus: OfflinePrefetchStatus | null;
  prefetchStatus: OfflinePrefetchStatus | null;
  dafYomiMasechet: OfflineMasechetTarget | null;
  personalMasechet: OfflineMasechetTarget | null;
  dayCount: number;
  startDaysPrefetch: () => Promise<void>;
  startMasechetPrefetch: (masechetEn: string, masechetHe?: string) => Promise<void>;
  cancelPrefetch: () => void;
  refreshPrefetchStatus: () => Promise<void>;
}

function resolveMasechetHe(masechetEn: string, fallbackHe?: string): string {
  const match = SHAS_MASECHTOT.find((m) => m.en === masechetEn);
  return match?.he ?? fallbackHe ?? masechetEn;
}

export function useOfflinePrefetch({
  onFeedback,
  onCompleted,
}: UseOfflinePrefetchParams = {}): UseOfflinePrefetchReturn {
  const settings = useAppStore((state) => state.settings);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchProgress, setPrefetchProgress] = useState<OfflinePrefetchProgress | null>(null);
  const [activeTargetLabel, setActiveTargetLabel] = useState<string | null>(null);
  const [daysStatus, setDaysStatus] = useState<OfflinePrefetchStatus | null>(null);
  const [dafYomiStatus, setDafYomiStatus] = useState<OfflinePrefetchStatus | null>(null);
  const [personalStatus, setPersonalStatus] = useState<OfflinePrefetchStatus | null>(null);
  const cancelRef = useRef(false);

  const dafYomiMasechetInfo = useMemo(() => {
    if (!settings) return null;
    const day = getDafByDate(getDafDayDate(new Date(), settings));
    return {
      masechetEn: day.masechetEn,
      masechetHe: day.masechet,
    };
  }, [settings]);

  const personalMasechetInfo = useMemo(() => {
    const en = settings?.active_personal_masechet?.trim();
    if (!en) return null;
    return {
      masechetEn: en,
      masechetHe: resolveMasechetHe(en),
    };
  }, [settings?.active_personal_masechet]);

  const refreshPrefetchStatus = useCallback(async () => {
    try {
      const gemaraNikud = settings?.gemara_nikud !== 0;
      const days = await getOfflinePrefetchStatus({
        dayCount: OFFLINE_PREFETCH_DAY_COUNT,
        gemaraNikud,
        dafDaySettings: settings ?? {},
      });
      setDaysStatus(days);

      if (dafYomiMasechetInfo) {
        const status = await getOfflineMasechetStatus(dafYomiMasechetInfo.masechetEn, {
          gemaraNikud,
        });
        setDafYomiStatus(status);
      } else {
        setDafYomiStatus(null);
      }

      if (personalMasechetInfo) {
        const status = await getOfflineMasechetStatus(personalMasechetInfo.masechetEn, {
          gemaraNikud,
        });
        setPersonalStatus(status);
      } else {
        setPersonalStatus(null);
      }
    } catch {
      setDaysStatus(null);
      setDafYomiStatus(null);
      setPersonalStatus(null);
    }
  }, [dafYomiMasechetInfo, personalMasechetInfo, settings]);

  useEffect(() => {
    void refreshPrefetchStatus();
  }, [refreshPrefetchStatus]);

  const cancelPrefetch = useCallback(() => {
    if (isPrefetching) {
      cancelRef.current = true;
    }
  }, [isPrefetching]);

  const reportResult = useCallback(
    (result: OfflinePrefetchResult, successMessage: string) => {
      if (result.cancelled) {
        onFeedback?.({
          title: 'ההורדה בוטלה',
          message: 'הדפים שהספיקו להישמר יישארו במכשיר.',
          iconName: 'close-circle',
          toast: true,
          autoCloseMs: 3000,
        });
        return;
      }

      if (result.failureCount === 0) {
        onFeedback?.({
          title: 'הדפים מוכנים לקריאה ללא רשת',
          message: successMessage,
          iconName: 'cloud-done-outline',
          toast: true,
          autoCloseMs: 3500,
        });
        return;
      }

      if (result.successCount === 0) {
        onFeedback?.({
          title: 'ההורדה נכשלה',
          message: 'לא הצלחנו לשמור דפים. בדקו את החיבור לרשת ונסו שוב.',
          iconName: 'cloud-offline-outline',
          toast: true,
          autoCloseMs: 3500,
        });
        return;
      }

      onFeedback?.({
        title: 'ההורדה הושלמה חלקית',
        message: `נשמרו ${result.successCount} מתוך ${result.total} פריטים.`,
        iconName: 'warning-outline',
        toast: true,
        autoCloseMs: 3500,
      });
    },
    [onFeedback],
  );

  const runPrefetch = useCallback(
    async (
      label: string,
      successMessage: string,
      runner: () => Promise<OfflinePrefetchResult>,
    ) => {
      if (isPrefetching) {
        return;
      }

      cancelRef.current = false;
      setIsPrefetching(true);
      setActiveTargetLabel(label);
      setPrefetchProgress({ completed: 0, total: 0 });

      try {
        const result = await runner();
        setPrefetchProgress(null);
        setActiveTargetLabel(null);
        await refreshPrefetchStatus();
        onCompleted?.();
        reportResult(result, successMessage);
      } catch {
        setPrefetchProgress(null);
        setActiveTargetLabel(null);
        onFeedback?.({
          title: 'ההורדה נכשלה',
          message: 'אירעה שגיאה. בדקו את החיבור לרשת ונסו שוב.',
          iconName: 'alert-circle',
          toast: true,
          autoCloseMs: 3500,
        });
      } finally {
        cancelRef.current = false;
        setIsPrefetching(false);
      }
    },
    [isPrefetching, onCompleted, onFeedback, refreshPrefetchStatus, reportResult],
  );

  const startDaysPrefetch = useCallback(async () => {
    await runPrefetch(
      `${OFFLINE_PREFETCH_DAY_COUNT} ימים קרובים`,
      `נשמרו הפריטים עבור ${OFFLINE_PREFETCH_DAY_COUNT} הימים הקרובים.`,
      () =>
        prefetchOfflineDays({
          dayCount: OFFLINE_PREFETCH_DAY_COUNT,
          gemaraNikud: settings?.gemara_nikud !== 0,
          dafDaySettings: settings ?? {},
          shouldCancel: () => cancelRef.current,
          onProgress: setPrefetchProgress,
        }),
    );
  }, [runPrefetch, settings]);

  const startMasechetPrefetch = useCallback(
    async (masechetEn: string, masechetHe?: string) => {
      const he = resolveMasechetHe(masechetEn, masechetHe);
      await runPrefetch(`מסכת ${he}`, `מסכת ${he} נשמרה במכשיר לקריאה ללא רשת.`, () =>
        prefetchOfflineMasechet(masechetEn, {
          gemaraNikud: settings?.gemara_nikud !== 0,
          shouldCancel: () => cancelRef.current,
          onProgress: setPrefetchProgress,
        }),
      );
    },
    [runPrefetch, settings?.gemara_nikud],
  );

  return {
    isPrefetching,
    prefetchProgress,
    activeTargetLabel,
    daysStatus,
    prefetchStatus: daysStatus,
    dafYomiMasechet: dafYomiMasechetInfo
      ? { ...dafYomiMasechetInfo, status: dafYomiStatus }
      : null,
    personalMasechet: personalMasechetInfo
      ? { ...personalMasechetInfo, status: personalStatus }
      : null,
    dayCount: OFFLINE_PREFETCH_DAY_COUNT,
    startDaysPrefetch,
    startMasechetPrefetch,
    cancelPrefetch,
    refreshPrefetchStatus,
  };
}
