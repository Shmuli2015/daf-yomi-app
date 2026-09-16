import { useCallback, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getDateStr, getDafByDate } from '../utils/dafYomi';
import { triggerImpact } from '../utils/haptics';
import { subDays } from 'date-fns';

type UseHomeMarkingParams = {
  currentDate: Date;
  isFuture: boolean;
  studyStatus: 'none' | 'partial' | 'learned';
  todayMasechet: string;
  todayDafNum: string;
  masechetLearned: number;
  masechetTotal: number;
};

export function useHomeMarking({
  currentDate,
  isFuture,
  studyStatus,
  todayMasechet,
  todayDafNum,
  masechetLearned,
  masechetTotal,
}: UseHomeMarkingParams) {
  const toggleAnyDafLearned = useAppStore((s) => s.toggleAnyDafLearned);
  const setDafStudyStatus = useAppStore((s) => s.setDafStudyStatus);
  const markPartialAmud = useAppStore((s) => s.markPartialAmud);
  const showConfettiPref = useAppStore((s) => s.settings?.show_confetti);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showSiyumModal, setShowSiyumModal] = useState(false);
  const [siyumMasechet, setSiyumMasechet] = useState<{ he: string; pages: number } | null>(null);

  const celebrateIfNeeded = useCallback(
    (nextIsLearned: boolean) => {
      if (!nextIsLearned) return;
      if (masechetTotal > 0 && masechetLearned + 1 === masechetTotal) {
        setSiyumMasechet({ he: todayMasechet, pages: masechetTotal });
        setShowSiyumModal(true);
        return;
      }
      if (showConfettiPref) {
        setShowConfetti(true);
      }
    },
    [masechetLearned, masechetTotal, showConfettiPref, todayMasechet],
  );

  const handleToggle = useCallback(() => {
    void triggerImpact('medium');
    const willLearn = studyStatus !== 'learned' && studyStatus !== 'partial';
    celebrateIfNeeded(willLearn);
    toggleAnyDafLearned(getDateStr(currentDate), todayMasechet, todayDafNum);
  }, [
    celebrateIfNeeded,
    currentDate,
    studyStatus,
    todayDafNum,
    todayMasechet,
    toggleAnyDafLearned,
  ]);

  const handleMarkFull = useCallback(() => {
    void triggerImpact('medium');
    celebrateIfNeeded(studyStatus !== 'learned');
    setDafStudyStatus(getDateStr(currentDate), todayMasechet, todayDafNum, 'learned');
  }, [
    celebrateIfNeeded,
    currentDate,
    setDafStudyStatus,
    studyStatus,
    todayDafNum,
    todayMasechet,
  ]);

  const handleMarkPartialA = useCallback(() => {
    void triggerImpact('light');
    markPartialAmud(getDateStr(currentDate), todayMasechet, todayDafNum, 'a');
  }, [currentDate, markPartialAmud, todayDafNum, todayMasechet]);

  const handleMarkPartialB = useCallback(() => {
    void triggerImpact('light');
    markPartialAmud(getDateStr(currentDate), todayMasechet, todayDafNum, 'b');
  }, [currentDate, markPartialAmud, todayDafNum, todayMasechet]);

  const handleMarkYesterday = useCallback(() => {
    void triggerImpact('medium');
    const yesterday = subDays(new Date(), 1);
    const dafInfo = getDafByDate(yesterday);
    setDafStudyStatus(getDateStr(yesterday), dafInfo.masechet, dafInfo.daf, 'learned');
  }, [setDafStudyStatus]);

  const closeSiyum = useCallback(() => {
    setShowSiyumModal(false);
    setSiyumMasechet(null);
  }, []);

  return {
    handleToggle,
    handleMarkFull,
    handleMarkPartialA,
    handleMarkPartialB,
    handleMarkYesterday,
    showConfetti,
    setShowConfetti,
    showSiyumModal,
    siyumMasechet,
    closeSiyum,
  };
}
