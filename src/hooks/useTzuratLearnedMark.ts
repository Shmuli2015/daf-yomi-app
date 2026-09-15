import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { getPartialAmud, getStudyStatus } from '../utils/dafStatus';
import { getDafDateStr } from '../utils/shas';
import { isTamidStartDaf } from '../utils/mishnahOnlySefaria';
import { getMasechetProgressFromCache } from '../utils/progressCache';
import { isPersonalTrackEnabled, type StudyTrackMode } from '../utils/personalTrack';
import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';
import { triggerImpact } from '../utils/haptics';

interface UseTzuratLearnedMarkParams {
  masechetEn: string;
  masechetHe?: string;
  dafNum: number;
}

export function useTzuratLearnedMark({
  masechetEn,
  masechetHe,
  dafNum,
}: UseTzuratLearnedMarkParams) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSiyumModal, setShowSiyumModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<StudyTrackMode>('dafYomi');

  const {
    history,
    settings,
    progressCache,
    personalTrackRecords,
    toggleAnyDafLearned,
    setDafStudyStatus,
    markPartialAmud,
    markPersonalDafLearned,
    markPersonalPartialAmud,
    setPersonalDafStudyStatus,
  } = useAppStore(
    useShallow((s) => ({
      history: s.history,
      settings: s.settings,
      progressCache: s.progressCache,
      personalTrackRecords: s.personalTrackRecords,
      toggleAnyDafLearned: s.toggleAnyDafLearned,
      setDafStudyStatus: s.setDafStudyStatus,
      markPartialAmud: s.markPartialAmud,
      markPersonalDafLearned: s.markPersonalDafLearned,
      markPersonalPartialAmud: s.markPersonalPartialAmud,
      setPersonalDafStudyStatus: s.setPersonalDafStudyStatus,
    })),
  );

  const personalEnabled = isPersonalTrackEnabled(settings);

  const masechetTotalPages = useMemo(
    () => SHAS_MASECHTOT.find((m) => m.he === masechetHe)?.pages ?? 0,
    [masechetHe],
  );

  const dafYomiMasechetHe = isTamidStartDaf(masechetEn, dafNum) ? 'קינים' : masechetHe;

  const dateStr = useMemo(
    () => (dafYomiMasechetHe ? getDafDateStr(dafYomiMasechetHe, dafNum) : null),
    [dafYomiMasechetHe, dafNum],
  );

  const dafHeStr = useMemo(
    () => `דף ${numberToGematria(dafNum)}`,
    [dafNum],
  );

  const personalRecord = useMemo(
    () => personalTrackRecords.find((r) => r.masechet === masechetEn && r.daf_num === dafNum),
    [personalTrackRecords, masechetEn, dafNum],
  );

  const dailyRecord = useMemo(() => {
    if (!dateStr) return undefined;
    return history.find((r) => r.date === dateStr);
  }, [history, dateStr]);

  const dafYomiStatus = useMemo(
    () => (dateStr ? getStudyStatus(dailyRecord) : 'none' as const),
    [dateStr, dailyRecord],
  );

  const personalStatus = useMemo(
    () => getStudyStatus(personalRecord),
    [personalRecord],
  );

  const dafYomiPartialAmud = useMemo(
    () => (dateStr ? getPartialAmud(dailyRecord) : null),
    [dateStr, dailyRecord],
  );

  const personalPartialAmud = useMemo(
    () => getPartialAmud(personalRecord),
    [personalRecord],
  );

  const canMarkDafYomi = dateStr != null && dafYomiMasechetHe != null;
  const canMarkPersonal = personalEnabled && Boolean(masechetEn);
  const canMarkLearned = canMarkDafYomi || canMarkPersonal;

  const studyStatus = useMemo(() => {
    if (!personalEnabled) return dafYomiStatus;
    if (dafYomiStatus === 'learned' && personalStatus === 'learned') return 'learned' as const;
    return 'none' as const;
  }, [personalEnabled, dafYomiStatus, personalStatus]);

  const menuPartialAmud =
    pendingTrack === 'personal' ? personalPartialAmud : dafYomiPartialAmud;
  const menuStudyStatus = pendingTrack === 'personal' ? personalStatus : dafYomiStatus;

  const celebrateIfNeeded = useCallback(
    (isCompleting: boolean) => {
      if (isCompleting) {
        setShowSiyumModal(true);
      } else if (settings?.show_confetti === 1) {
        setShowConfetti(true);
      }
    },
    [settings],
  );

  const isCompletingMasechet = useCallback(
    (mode: StudyTrackMode) => {
      if (masechetTotalPages <= 0) return false;
      if (mode === 'personal') {
        const learnedCount = personalTrackRecords.filter(
          (r) => r.masechet === masechetEn && r.status === 'learned',
        ).length;
        return learnedCount + 1 === masechetTotalPages;
      }
      if (isTamidStartDaf(masechetEn, dafNum)) {
        const kinnimPages = SHAS_MASECHTOT.find((m) => m.en === 'Kinnim')?.pages ?? 0;
        if (kinnimPages <= 0) return false;
        const learnedBefore = progressCache
          ? getMasechetProgressFromCache(progressCache, 'קינים').learned
          : 0;
        return learnedBefore + 1 === kinnimPages;
      }
      if (!masechetHe) return false;
      const learnedBefore = progressCache
        ? getMasechetProgressFromCache(progressCache, masechetHe).learned
        : 0;
      return learnedBefore + 1 === masechetTotalPages;
    },
    [masechetTotalPages, personalTrackRecords, masechetEn, masechetHe, progressCache, dafNum],
  );

  const markFullOnTrack = useCallback(
    (mode: StudyTrackMode) => {
      void triggerImpact('medium');
      const isCompleting = isCompletingMasechet(mode);

      if (mode === 'personal') {
        celebrateIfNeeded(isCompleting);
        markPersonalDafLearned(masechetEn, dafNum);
        return;
      }

      if (!dateStr || !dafYomiMasechetHe) return;
      celebrateIfNeeded(isCompleting);
      setDafStudyStatus(dateStr, dafYomiMasechetHe, dafHeStr, 'learned');
    },
    [
      isCompletingMasechet,
      celebrateIfNeeded,
      masechetEn,
      dafNum,
      dateStr,
      dafYomiMasechetHe,
      dafHeStr,
      markPersonalDafLearned,
      setDafStudyStatus,
    ],
  );

  const handleToggleLearned = useCallback(() => {
    if (!canMarkLearned) return;

    if (personalEnabled) {
      setShowTrackPicker(true);
      return;
    }

    if (dafYomiStatus === 'learned') {
      setPendingTrack('dafYomi');
      setShowConfirm(true);
      return;
    }

    if (dafYomiStatus === 'partial') {
      markFullOnTrack('dafYomi');
      return;
    }

    void triggerImpact('medium');
    const isCompleting = isCompletingMasechet('dafYomi');
    celebrateIfNeeded(isCompleting);
    if (dateStr && dafYomiMasechetHe) {
      toggleAnyDafLearned(dateStr, dafYomiMasechetHe, dafHeStr);
    }
  }, [
    canMarkLearned,
    personalEnabled,
    dafYomiStatus,
    markFullOnTrack,
    isCompletingMasechet,
    celebrateIfNeeded,
    dateStr,
    dafYomiMasechetHe,
    dafHeStr,
    toggleAnyDafLearned,
  ]);

  const handleSelectTrack = useCallback(
    (mode: StudyTrackMode) => {
      setShowTrackPicker(false);
      const status = mode === 'personal' ? personalStatus : dafYomiStatus;
      if (status === 'learned') {
        setPendingTrack(mode);
        setShowConfirm(true);
        return;
      }
      markFullOnTrack(mode);
    },
    [personalStatus, dafYomiStatus, markFullOnTrack],
  );

  const handleOpenHalfMenuForTrack = useCallback((mode: StudyTrackMode) => {
    setShowTrackPicker(false);
    setPendingTrack(mode);
  }, []);

  const handleSelectFull = useCallback(() => {
    markFullOnTrack(pendingTrack);
  }, [markFullOnTrack, pendingTrack]);

  const handleSelectHalfA = useCallback(() => {
    void triggerImpact('light');
    if (pendingTrack === 'personal') {
      markPersonalPartialAmud(masechetEn, dafNum, 'a');
      return;
    }
    if (dateStr && dafYomiMasechetHe) {
      markPartialAmud(dateStr, dafYomiMasechetHe, dafHeStr, 'a');
    }
  }, [
    pendingTrack,
    masechetEn,
    dafNum,
    dateStr,
    dafYomiMasechetHe,
    dafHeStr,
    markPersonalPartialAmud,
    markPartialAmud,
  ]);

  const handleSelectHalfB = useCallback(() => {
    void triggerImpact('light');
    if (pendingTrack === 'personal') {
      markPersonalPartialAmud(masechetEn, dafNum, 'b');
      return;
    }
    if (dateStr && dafYomiMasechetHe) {
      markPartialAmud(dateStr, dafYomiMasechetHe, dafHeStr, 'b');
    }
  }, [
    pendingTrack,
    masechetEn,
    dafNum,
    dateStr,
    dafYomiMasechetHe,
    dafHeStr,
    markPersonalPartialAmud,
    markPartialAmud,
  ]);

  const handleConfirmUnmark = useCallback(() => {
    setShowConfirm(false);
    void triggerImpact('light');
    if (pendingTrack === 'personal') {
      setPersonalDafStudyStatus(masechetEn, dafNum, 'none');
      return;
    }
    if (dateStr && dafYomiMasechetHe) {
      toggleAnyDafLearned(dateStr, dafYomiMasechetHe, dafHeStr);
    }
  }, [
    pendingTrack,
    masechetEn,
    dafNum,
    dateStr,
    dafYomiMasechetHe,
    dafHeStr,
    setPersonalDafStudyStatus,
    toggleAnyDafLearned,
  ]);

  const requestUnmarkPending = useCallback(() => {
    setShowConfirm(true);
  }, []);

  return {
    personalEnabled,
    studyStatus,
    dafYomiStatus,
    personalStatus,
    dafYomiPartialAmud,
    personalPartialAmud,
    menuPartialAmud,
    menuStudyStatus,
    canMarkLearned,
    canMarkDafYomi,
    masechetTotalPages,
    handleToggleLearned,
    handleSelectTrack,
    handleOpenHalfMenuForTrack,
    handleSelectFull,
    handleSelectHalfA,
    handleSelectHalfB,
    handleConfirmUnmark,
    requestUnmarkPending,
    showTrackPicker,
    setShowTrackPicker,
    showConfirm,
    setShowConfirm,
    showSiyumModal,
    setShowSiyumModal,
    showConfetti,
    setShowConfetti,
  };
}
