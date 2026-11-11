import { useCallback, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { maybeRequestStoreReview, maybeRequestStoreReviewForStreak } from '../services/storeReview';
import { getDafDayYesterday } from '../utils/dafDayBoundary';
import { getDateStr, getDafByDate } from '../utils/dafYomi';
import { triggerImpact } from '../utils/haptics';
import { announceAccessibility } from '../utils/accessibilityAnnounce';

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

  const requestReviewIfStreakMilestone = useCallback((learnedNow: boolean) => {
    if (!learnedNow) return;
    maybeRequestStoreReviewForStreak(useAppStore.getState().streak);
  }, []);

  const handleToggle = useCallback(() => {
    void triggerImpact('medium');
    const willLearn = studyStatus !== 'learned' && studyStatus !== 'partial';
    const isCompleting =
      willLearn && masechetTotal > 0 && masechetLearned + 1 === masechetTotal;
    celebrateIfNeeded(willLearn);
    toggleAnyDafLearned(getDateStr(currentDate), todayMasechet, todayDafNum);
    if (willLearn) {
      announceAccessibility(`מסכת ${todayMasechet} דף ${todayDafNum} סומן כנלמד`);
    } else {
      announceAccessibility(`מסכת ${todayMasechet} דף ${todayDafNum} בוטל הסימון`);
    }
    if (!isCompleting) {
      requestReviewIfStreakMilestone(willLearn);
    }
  }, [
    celebrateIfNeeded,
    currentDate,
    masechetLearned,
    masechetTotal,
    requestReviewIfStreakMilestone,
    studyStatus,
    todayDafNum,
    todayMasechet,
    toggleAnyDafLearned,
  ]);

  const handleMarkFull = useCallback(() => {
    void triggerImpact('medium');
    const willLearn = studyStatus !== 'learned';
    const isCompleting =
      willLearn && masechetTotal > 0 && masechetLearned + 1 === masechetTotal;
    celebrateIfNeeded(willLearn);
    setDafStudyStatus(getDateStr(currentDate), todayMasechet, todayDafNum, 'learned');
    announceAccessibility(`מסכת ${todayMasechet} דף ${todayDafNum} סומן כנלמד`);
    if (!isCompleting) {
      requestReviewIfStreakMilestone(willLearn);
    }
  }, [
    celebrateIfNeeded,
    currentDate,
    masechetLearned,
    masechetTotal,
    requestReviewIfStreakMilestone,
    setDafStudyStatus,
    studyStatus,
    todayDafNum,
    todayMasechet,
  ]);

  const handleMarkPartialA = useCallback(() => {
    void triggerImpact('light');
    markPartialAmud(getDateStr(currentDate), todayMasechet, todayDafNum, 'a');
    announceAccessibility(`מסכת ${todayMasechet} דף ${todayDafNum} סומן עמוד א׳ בלבד`);
  }, [currentDate, markPartialAmud, todayDafNum, todayMasechet]);

  const handleMarkPartialB = useCallback(() => {
    void triggerImpact('light');
    markPartialAmud(getDateStr(currentDate), todayMasechet, todayDafNum, 'b');
    announceAccessibility(`מסכת ${todayMasechet} דף ${todayDafNum} סומן עמוד ב׳ בלבד`);
  }, [currentDate, markPartialAmud, todayDafNum, todayMasechet]);

  const handleMarkYesterday = useCallback(() => {
    void triggerImpact('medium');
    const settings = useAppStore.getState().settings ?? {};
    const yesterday = getDafDayYesterday(new Date(), settings);
    const dafInfo = getDafByDate(yesterday);
    setDafStudyStatus(getDateStr(yesterday), dafInfo.masechet, dafInfo.daf, 'learned');
    announceAccessibility(`דף אתמול מסכת ${dafInfo.masechet} דף ${dafInfo.daf} סומן כנלמד`);
    maybeRequestStoreReviewForStreak(useAppStore.getState().streak);
  }, [setDafStudyStatus]);

  const closeSiyum = useCallback(() => {
    setShowSiyumModal(false);
    setSiyumMasechet(null);
    void maybeRequestStoreReview('siyum');
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
