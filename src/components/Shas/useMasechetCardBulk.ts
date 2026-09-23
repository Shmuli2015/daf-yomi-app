import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { SHAS_MASECHTOT } from '../../data/shas';
import { useAppStore } from '../../store/useAppStore';
import { triggerImpact } from '../../utils/haptics';
import {
  buildMasechetMarkAllUpdates,
  buildMasechetRecordByDate,
  buildMasechetUnmarkAllUpdates,
} from '../../utils/masechetBulkMark';
import { isPersonalTrackEnabled } from '../../utils/personalTrack';
import { getMasechetProgressFromCache } from '../../utils/progressCache';
import { getMasechetDafim } from '../../utils/shas';
import type { BulkConfirmVariant } from './BulkActionConfirmOverlay';

export function useMasechetCardBulk() {
  const [menuMasechet, setMenuMasechet] = useState<(typeof SHAS_MASECHTOT)[0] | null>(null);
  const [pendingAction, setPendingAction] = useState<BulkConfirmVariant | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    history,
    progressCache,
    personalTrackRecords,
    settings,
    batchMarkDafim,
    batchUnmarkDafim,
    togglePersonalDafLearned,
  } = useAppStore(
    useShallow((s) => ({
      history: s.history,
      progressCache: s.progressCache,
      personalTrackRecords: s.personalTrackRecords,
      settings: s.settings,
      batchMarkDafim: s.batchMarkDafim,
      batchUnmarkDafim: s.batchUnmarkDafim,
      togglePersonalDafLearned: s.togglePersonalDafLearned,
    })),
  );

  const isPersonalEnabled = isPersonalTrackEnabled(settings);

  const dafimArray = useMemo(
    () => (menuMasechet ? getMasechetDafim(menuMasechet.he) : []),
    [menuMasechet],
  );

  const trackProgress = useMemo(() => {
    if (!menuMasechet || !progressCache) {
      const total = menuMasechet?.pages ?? 0;
      return {
        dafYomiLearned: 0,
        personalLearned: 0,
        total,
      };
    }
    const progress = getMasechetProgressFromCache(progressCache, menuMasechet.he);
    return {
      dafYomiLearned: progress.dafYomiLearned,
      personalLearned: progress.personalLearned,
      total: progress.total || menuMasechet.pages,
    };
  }, [menuMasechet, progressCache]);

  const personalLearnedSet = useMemo(() => {
    if (!menuMasechet) return new Set<number>();
    return new Set(
      personalTrackRecords
        .filter((r) => r.masechet === menuMasechet.en && r.status === 'learned')
        .map((r) => r.daf_num),
    );
  }, [menuMasechet, personalTrackRecords]);

  const isDafYomiFullyMarked =
    trackProgress.total > 0 && trackProgress.dafYomiLearned >= trackProgress.total;
  const isPersonalFullyMarked =
    trackProgress.total > 0 && trackProgress.personalLearned >= trackProgress.total;

  const handleLongPress = useCallback((masechetEn: string) => {
    const masechet = SHAS_MASECHTOT.find((m) => m.en === masechetEn);
    if (!masechet) return;
    void triggerImpact('medium');
    setMenuMasechet(masechet);
  }, []);

  const handleCloseMenu = useCallback(() => {
    if (pendingAction !== null) return;
    setMenuMasechet(null);
  }, [pendingAction]);

  const handleSelectMarkAll = useCallback(() => {
    setPendingAction('markAll');
  }, []);

  const handleSelectUnmarkAll = useCallback(() => {
    setPendingAction('unmarkAll');
  }, []);

  const handleSelectMarkAllPersonal = useCallback(() => {
    setPendingAction('markAllPersonal');
  }, []);

  const handleSelectUnmarkAllPersonal = useCallback(() => {
    setPendingAction('unmarkAllPersonal');
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setPendingAction(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!menuMasechet) return;
    const action = pendingAction;
    const masechetHe = menuMasechet.he;
    const masechetEn = menuMasechet.en;
    const dafim = dafimArray;
    const learnedSet = personalLearnedSet;
    setIsLoading(true);
    setPendingAction(null);
    setMenuMasechet(null);

    setTimeout(() => {
      try {
        if (action === 'markAll') {
          const recordByDate = buildMasechetRecordByDate(history, masechetHe, dafim);
          const updates = buildMasechetMarkAllUpdates(masechetHe, dafim, recordByDate);
          if (updates.length > 0) batchMarkDafim(updates);
        } else if (action === 'unmarkAll') {
          const recordByDate = buildMasechetRecordByDate(history, masechetHe, dafim);
          const updates = buildMasechetUnmarkAllUpdates(masechetHe, dafim, recordByDate);
          if (updates.length > 0) batchUnmarkDafim(updates);
        } else if (action === 'markAllPersonal') {
          for (const dafNum of dafim) {
            if (!learnedSet.has(dafNum)) {
              togglePersonalDafLearned(masechetEn, dafNum);
            }
          }
        } else if (action === 'unmarkAllPersonal') {
          for (const dafNum of dafim) {
            if (learnedSet.has(dafNum)) {
              togglePersonalDafLearned(masechetEn, dafNum);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    }, 0);
  }, [
    menuMasechet,
    pendingAction,
    dafimArray,
    personalLearnedSet,
    history,
    batchMarkDafim,
    batchUnmarkDafim,
    togglePersonalDafLearned,
  ]);

  return {
    menuMasechet,
    pendingAction,
    isLoading,
    dafCount: dafimArray.length,
    isPersonalEnabled,
    showMark: !isDafYomiFullyMarked,
    showUnmark: trackProgress.dafYomiLearned > 0,
    showMarkPersonal: isPersonalEnabled && !isPersonalFullyMarked,
    showUnmarkPersonal: isPersonalEnabled && trackProgress.personalLearned > 0,
    handleLongPress,
    handleCloseMenu,
    handleSelectMarkAll,
    handleSelectUnmarkAll,
    handleSelectMarkAllPersonal,
    handleSelectUnmarkAllPersonal,
    handleCancelConfirm,
    handleConfirm,
  };
}
