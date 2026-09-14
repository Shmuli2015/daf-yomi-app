import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { getPartialAmud, getStudyStatus } from '../utils/dafStatus';
import { getDafDateStr } from '../utils/shas';
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

  const dateStr = useMemo(
    () => (masechetHe ? getDafDateStr(masechetHe, dafNum) : null),
    [masechetHe, dafNum],
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

  const canMarkDafYomi = dateStr != null && masechetHe != null;
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
      if (!masechetHe) return false;
      const learnedBefore = progressCache
        ? getMasechetProgressFromCache(progressCache, masechetHe).learned
        : 0;
      return learnedBefore + 1 === masechetTotalPages;
    },
    [masechetTotalPages, personalTrackRecords, masechetEn, masechetHe, progressCache],
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

      if (!dateStr || !masechetHe) return;
      celebrateIfNeeded(isCompleting);
      setDafStudyStatus(dateStr, masechetHe, dafHeStr, 'learned');
    },
    [
      isCompletingMasechet,
      celebrateIfNeeded,
      masechetEn,
      dafNum,
      dateStr,
      masechetHe,
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
    if (dateStr && masechetHe) {
      toggleAnyDafLearned(dateStr, masechetHe, dafHeStr);
    }
  }, [
    canMarkLearned,
    personalEnabled,
    dafYomiStatus,
    markFullOnTrack,
    isCompletingMasechet,
    celebrateIfNeeded,
    dateStr,
    masechetHe,
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
    if (dateStr && masechetHe) {
      markPartialAmud(dateStr, masechetHe, dafHeStr, 'a');
    }
  }, [
    pendingTrack,
    masechetEn,
    dafNum,
    dateStr,
    masechetHe,
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
    if (dateStr && masechetHe) {
      markPartialAmud(dateStr, masechetHe, dafHeStr, 'b');
    }
  }, [
    pendingTrack,
    masechetEn,
    dafNum,
    dateStr,
    masechetHe,
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
    if (dateStr && masechetHe) {
      toggleAnyDafLearned(dateStr, masechetHe, dafHeStr);
    }
  }, [
    pendingTrack,
    masechetEn,
    dafNum,
    dateStr,
    masechetHe,
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
