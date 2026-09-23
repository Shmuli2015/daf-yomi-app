import { useState, useMemo, useCallback, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, numberToGematria } from '../../data/shas';
import { getDafDateStr, getMasechetDafim } from '../../utils/shas';
import { getStudyStatus, getPartialAmud, type AmudSide } from '../../utils/dafStatus';
import { getMasechetProgressFromCache } from '../../utils/progressCache';
import {
  buildMasechetMarkAllUpdates,
  buildMasechetRecordByDate,
  buildMasechetUnmarkAllUpdates,
} from '../../utils/masechetBulkMark';
import { isPersonalTrackEnabled } from '../../utils/personalTrack';
import { useSheetDismissGesture } from '../../hooks/useSheetDismissGesture';
import { triggerImpact } from '../../utils/haptics';
import type { PersonalTrackRecord } from '../../db/database';
import type { MasechetStudyMode } from './MasechetModalModeToggle';

interface UseMasechetModalProps {
  masechet: typeof SHAS_MASECHTOT[0];
  onClose: () => void;
  windowWidth: number;
}

export function useMasechetModal({
  masechet,
  onClose,
  windowWidth,
}: UseMasechetModalProps) {
  const [mode, setMode] = useState<MasechetStudyMode>('dafYomi');
  const [selectedDafForMenu, setSelectedDafForMenu] = useState<number | null>(null);
  const [showSiyum, setShowSiyum] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingAction, setPendingAction] = useState<'markAll' | 'unmarkAll' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAnyDafLearned = useAppStore((s) => s.toggleAnyDafLearned);
  const setDafStudyStatus = useAppStore((s) => s.setDafStudyStatus);
  const markPartialAmud = useAppStore((s) => s.markPartialAmud);
  const batchMarkDafim = useAppStore((s) => s.batchMarkDafim);
  const batchUnmarkDafim = useAppStore((s) => s.batchUnmarkDafim);
  const togglePersonalDafLearned = useAppStore((s) => s.togglePersonalDafLearned);
  const markPersonalDafLearned = useAppStore((s) => s.markPersonalDafLearned);
  const markPersonalPartialAmud = useAppStore((s) => s.markPersonalPartialAmud);
  const setPersonalDafStudyStatus = useAppStore((s) => s.setPersonalDafStudyStatus);
  const setActivePersonalMasechet = useAppStore((s) => s.setActivePersonalMasechet);
  const clearActivePersonalMasechet = useAppStore((s) => s.clearActivePersonalMasechet);

  const {
    history,
    progressCache,
    personalTrackRecords,
    activePersonalMasechet,
    settings,
  } = useAppStore(
    useShallow((s) => ({
      history: s.history,
      progressCache: s.progressCache,
      personalTrackRecords: s.personalTrackRecords,
      activePersonalMasechet: s.activePersonalMasechet,
      settings: s.settings,
    })),
  );

  const dafimArray = useMemo(() => getMasechetDafim(masechet.he), [masechet.he]);

  const numColumns = useMemo(() => {
    const availableWidth = windowWidth - 40;
    return Math.max(4, Math.floor((availableWidth + 8) / (48 + 8)));
  }, [windowWidth]);

  const recordByDate = useMemo(
    () => buildMasechetRecordByDate(history, masechet.he, dafimArray),
    [history, masechet.he, dafimArray],
  );

  const masechetPersonalRecords = useMemo(() => {
    return personalTrackRecords.filter((r) => r.masechet === masechet.en);
  }, [masechet.en, personalTrackRecords]);

  const personalLearnedSet = useMemo(() => {
    return new Set(
      masechetPersonalRecords.filter((r) => r.status === 'learned').map((r) => r.daf_num)
    );
  }, [masechetPersonalRecords]);

  const personalPartialMap = useMemo(() => {
    const map = new Map<number, PersonalTrackRecord>();
    for (const r of masechetPersonalRecords) {
      if (r.status === 'partial') {
        map.set(r.daf_num, r);
      }
    }
    return map;
  }, [masechetPersonalRecords]);

  const masechetStats = useMemo(() => {
    if (!progressCache) {
      return { learned: 0, total: masechet.pages, dafYomiLearned: 0, personalLearned: 0 };
    }
    return getMasechetProgressFromCache(progressCache, masechet.he);
  }, [progressCache, masechet.he, masechet.pages]);

  const pct = masechetStats.total > 0
    ? Math.round((masechetStats.learned / masechetStats.total) * 100)
    : 0;

  const isHomeActive = activePersonalMasechet === masechet.en;
  const handleToggleHomeActive = useCallback(() => {
    if (isHomeActive) {
      clearActivePersonalMasechet();
    } else {
      setActivePersonalMasechet(masechet.en);
    }
  }, [isHomeActive, masechet.en, clearActivePersonalMasechet, setActivePersonalMasechet]);

  const handleRequestClose = useCallback(() => {
    if (pendingAction !== null) {
      setPendingAction(null);
      return;
    }
    onClose();
  }, [pendingAction, onClose]);

  const { panHandlers, sheetAnimatedStyle, overlayAnimatedStyle, animationType } =
    useSheetDismissGesture({
      visible: true,
      onClose: handleRequestClose,
    });

  const isPersonalEnabled = isPersonalTrackEnabled(settings);
  const effectiveMode = isPersonalEnabled ? mode : 'dafYomi';

  const handleToggleDaf = useCallback((dafNum: number) => {
    if (effectiveMode === 'personal') {
      void triggerImpact('light');
      const isAlreadyLearned = personalLearnedSet.has(dafNum);
      if (!isAlreadyLearned && personalLearnedSet.size + 1 === dafimArray.length) {
        setShowSiyum(true);
      }
      togglePersonalDafLearned(masechet.en, dafNum);
      return;
    }

    const dateStr = getDafDateStr(masechet.he, dafNum);
    if (!dateStr) return;

    void triggerImpact('light');
    const currentStatus = getStudyStatus(recordByDate.get(dateStr));
    const learnedBefore = progressCache
      ? getMasechetProgressFromCache(progressCache, masechet.he).learned
      : 0;
    const dafHeStr = `דף ${numberToGematria(dafNum)}`;

    if (currentStatus === 'partial') {
      setDafStudyStatus(dateStr, masechet.he, dafHeStr, 'learned');
    } else {
      toggleAnyDafLearned(dateStr, masechet.he, dafHeStr);
    }

    if (currentStatus !== 'learned' && learnedBefore + 1 === dafimArray.length) {
      setShowSiyum(true);
    } else if (currentStatus !== 'learned' && settings?.show_confetti) {
      setTimeout(() => setShowConfetti(true), 200);
    }
  }, [effectiveMode, masechet.en, masechet.he, togglePersonalDafLearned, personalLearnedSet, recordByDate, progressCache, dafimArray.length, toggleAnyDafLearned, setDafStudyStatus, settings]);

  const handleToggleDafRef = useRef(handleToggleDaf);
  handleToggleDafRef.current = handleToggleDaf;

  const handleToggleDafStable = useCallback((dafNum: number) => {
    handleToggleDafRef.current(dafNum);
  }, []);

  const handleLongPressDaf = useCallback((dafNum: number) => {
    setSelectedDafForMenu(dafNum);
  }, []);

  const handleLongPressDafRef = useRef(handleLongPressDaf);
  handleLongPressDafRef.current = handleLongPressDaf;

  const handleLongPressDafStable = useCallback((dafNum: number) => {
    handleLongPressDafRef.current(dafNum);
  }, []);

  const handleMarkAll = useCallback(() => {
    if (effectiveMode === 'personal') {
      for (const dafNum of dafimArray) {
        if (!personalLearnedSet.has(dafNum)) {
          togglePersonalDafLearned(masechet.en, dafNum);
        }
      }
      return;
    }

    const updates = buildMasechetMarkAllUpdates(masechet.he, dafimArray, recordByDate);

    if (updates.length > 0) {
      batchMarkDafim(updates);
      if (settings?.show_confetti) setTimeout(() => setShowConfetti(true), 200);
    }
  }, [effectiveMode, masechet.en, masechet.he, dafimArray, personalLearnedSet, togglePersonalDafLearned, recordByDate, batchMarkDafim, settings]);

  const handleUnmarkAll = useCallback(() => {
    if (effectiveMode === 'personal') {
      for (const dafNum of dafimArray) {
        if (personalLearnedSet.has(dafNum)) {
          togglePersonalDafLearned(masechet.en, dafNum);
        }
      }
      return;
    }

    const updates = buildMasechetUnmarkAllUpdates(masechet.he, dafimArray, recordByDate);

    if (updates.length > 0) {
      batchUnmarkDafim(updates);
    }
  }, [effectiveMode, masechet.en, masechet.he, dafimArray, personalLearnedSet, togglePersonalDafLearned, recordByDate, batchUnmarkDafim]);

  const handleMarkAllPress = useCallback(() => setPendingAction('markAll'), []);
  const handleUnmarkAllPress = useCallback(() => setPendingAction('unmarkAll'), []);

  const handleConfirm = useCallback(() => {
    const action = pendingAction;
    setIsLoading(true);
    setPendingAction(null);

    setTimeout(() => {
      try {
        if (action === 'markAll') {
          handleMarkAll();
        } else if (action === 'unmarkAll') {
          handleUnmarkAll();
        }
      } finally {
        setIsLoading(false);
      }
    }, 0);
  }, [pendingAction, handleMarkAll, handleUnmarkAll]);

  const handleCancel = useCallback(() => setPendingAction(null), []);

  const keyExtractor = useCallback((item: number) => String(item), []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: 56,
      offset: 56 * Math.floor(index / numColumns),
      index,
    }),
    [numColumns],
  );

  const getCellProps = useCallback(
    (dafNum: number) => {
      const dateStr = getDafDateStr(masechet.he, dafNum);
      const rec = dateStr ? recordByDate.get(dateStr) : undefined;
      const studyStatus = rec ? getStudyStatus(rec) : 'none';
      const partialAmud = rec ? getPartialAmud(rec) : null;
      const isPersonal = isPersonalEnabled && personalLearnedSet.has(dafNum);
      const personalRec = isPersonalEnabled ? personalPartialMap.get(dafNum) : undefined;
      const isPersonalPartial = personalRec != null;
      const personalPartialAmud = personalRec?.amud || null;
      return {
        dafNum,
        isLearned: studyStatus === 'learned',
        isPartial: studyStatus === 'partial',
        partialAmud,
        isPersonalLearned: isPersonal,
        isPersonalPartial,
        personalPartialAmud,
        mode: effectiveMode,
      };
    },
    [
      masechet.he,
      recordByDate,
      isPersonalEnabled,
      personalLearnedSet,
      personalPartialMap,
      effectiveMode,
    ],
  );

  const handleMenuSelectFull = useCallback(() => {
    if (selectedDafForMenu === null) return;
    const dafNum = selectedDafForMenu;
    setSelectedDafForMenu(null);
    if (effectiveMode === 'personal') {
      markPersonalDafLearned(masechet.en, dafNum);
    } else {
      const dateStr = getDafDateStr(masechet.he, dafNum);
      if (dateStr) {
        const dafHeStr = `דף ${numberToGematria(dafNum)}`;
        setDafStudyStatus(dateStr, masechet.he, dafHeStr, 'learned');
      }
    }
  }, [selectedDafForMenu, effectiveMode, markPersonalDafLearned, masechet.en, masechet.he, setDafStudyStatus]);

  const handleMenuSelectHalfA = useCallback(() => {
    if (selectedDafForMenu === null) return;
    const dafNum = selectedDafForMenu;
    setSelectedDafForMenu(null);
    if (effectiveMode === 'personal') {
      markPersonalPartialAmud(masechet.en, dafNum, 'a');
    } else {
      const dateStr = getDafDateStr(masechet.he, dafNum);
      if (dateStr) {
        const dafHeStr = `דף ${numberToGematria(dafNum)}`;
        markPartialAmud(dateStr, masechet.he, dafHeStr, 'a');
      }
    }
  }, [selectedDafForMenu, effectiveMode, markPersonalPartialAmud, masechet.en, masechet.he, markPartialAmud]);

  const handleMenuSelectHalfB = useCallback(() => {
    if (selectedDafForMenu === null) return;
    const dafNum = selectedDafForMenu;
    setSelectedDafForMenu(null);
    if (effectiveMode === 'personal') {
      markPersonalPartialAmud(masechet.en, dafNum, 'b');
    } else {
      const dateStr = getDafDateStr(masechet.he, dafNum);
      if (dateStr) {
        const dafHeStr = `דף ${numberToGematria(dafNum)}`;
        markPartialAmud(dateStr, masechet.he, dafHeStr, 'b');
      }
    }
  }, [selectedDafForMenu, effectiveMode, markPersonalPartialAmud, masechet.en, masechet.he, markPartialAmud]);

  const handleMenuUnmark = useCallback(() => {
    if (selectedDafForMenu === null) return;
    const dafNum = selectedDafForMenu;
    setSelectedDafForMenu(null);
    if (effectiveMode === 'personal') {
      setPersonalDafStudyStatus(masechet.en, dafNum, 'none');
    } else {
      const dateStr = getDafDateStr(masechet.he, dafNum);
      if (dateStr) {
        const dafHeStr = `דף ${numberToGematria(dafNum)}`;
        setDafStudyStatus(dateStr, masechet.he, dafHeStr, 'missed');
      }
    }
  }, [selectedDafForMenu, effectiveMode, setPersonalDafStudyStatus, masechet.en, masechet.he, setDafStudyStatus]);

  const handleMenuCancel = useCallback(() => {
    setSelectedDafForMenu(null);
  }, []);

  const menuPartialAmud: AmudSide | null = useMemo(() => {
    if (selectedDafForMenu === null) return null;
    if (effectiveMode === 'personal') {
      return personalPartialMap.get(selectedDafForMenu)?.amud || null;
    }
    const dStr = getDafDateStr(masechet.he, selectedDafForMenu);
    return dStr ? getPartialAmud(recordByDate.get(dStr)) : null;
  }, [selectedDafForMenu, effectiveMode, personalPartialMap, masechet.he, recordByDate]);

  const menuShowUnmark: boolean = useMemo(() => {
    if (selectedDafForMenu === null) return false;
    if (effectiveMode === 'personal') {
      return personalLearnedSet.has(selectedDafForMenu) || personalPartialMap.has(selectedDafForMenu);
    }
    const dStr = getDafDateStr(masechet.he, selectedDafForMenu);
    const st = dStr ? getStudyStatus(recordByDate.get(dStr)) : 'none';
    return st === 'learned' || st === 'partial';
  }, [selectedDafForMenu, effectiveMode, personalLearnedSet, personalPartialMap, masechet.he, recordByDate]);

  return {
    mode,
    setMode,
    effectiveMode,
    isPersonalEnabled,
    isHomeActive,
    handleToggleHomeActive,
    handleRequestClose,
    dafimArray,
    numColumns,
    masechetStats,
    pct,
    pendingAction,
    isLoading,
    handleMarkAllPress,
    handleUnmarkAllPress,
    handleConfirm,
    handleCancel,
    showConfetti,
    setShowConfetti,
    showSiyum,
    setShowSiyum,
    selectedDafForMenu,
    handleToggleDafStable,
    handleLongPressDafStable,
    sheetAnimatedStyle,
    overlayAnimatedStyle,
    animationType,
    keyExtractor,
    getItemLayout,
    getCellProps,
    handleMenuSelectFull,
    handleMenuSelectHalfA,
    handleMenuSelectHalfB,
    handleMenuUnmark,
    handleMenuCancel,
    menuPartialAmud,
    menuShowUnmark,
  };
}
