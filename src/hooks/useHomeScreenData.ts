import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { HDate } from '@hebcal/core';
import { format } from 'date-fns';
import { he } from 'date-fns/locale/he';
import { useAppStore } from '../store/useAppStore';
import { getDafDayDate } from '../utils/dafDayBoundary';
import { buildLast7Days, buildRecentHistoryKey } from '../utils/last7Days';
import { dafYomiDisplayMasechetHe, kinnimTamidCalendarDisplay } from '../utils/mishnahOnlySefaria';
import { getMasechetDafim } from '../utils/shas';
import { getStudyStatus, getPartialAmud } from '../utils/dafStatus';
import { getMasechetProgressFromCache } from '../utils/progressCache';
import { isPersonalTrackEnabled } from '../utils/personalTrack';
import { shouldShowYesterdayNudge } from '../utils/yesterdayNudge';
import { getHebrewDayEventInfo } from '../utils/hebrewCalendarEvents';
import { useHomeDateNav } from './useHomeDateNav';
import { HALF_DAF_TIP_VERSION } from '../constants/halfDafTip';

export function useHomeScreenData(nudgeDismissedFor: string | null) {
  const {
    todayRecord,
    todayMasechet,
    todayDafNum,
    todayMasechetEn,
    todayDafNumValue,
    todayAmud,
    streak,
    recentHistoryKey,
    showSecularDate,
    dismissedHalfDafTip,
    personalTrackEnabled,
    progressCache,
    isAppReady,
    dismissHalfDafTip,
    activePersonalMasechet,
    personalTrackRecords,
    setActivePersonalMasechet,
    clearActivePersonalMasechet,
    togglePersonalDafLearned,
  } = useAppStore(
    useShallow((s) => ({
      todayRecord: s.todayRecord,
      todayMasechet: s.todayMasechet,
      todayDafNum: s.todayDafNum,
      todayMasechetEn: s.todayMasechetEn,
      todayDafNumValue: s.todayDafNumValue,
      todayAmud: s.todayAmud,
      streak: s.streak,
      recentHistoryKey: buildRecentHistoryKey(s.history),
      showSecularDate: s.settings?.show_secular_date === 1,
      dismissedHalfDafTip: s.settings?.dismissed_half_daf_tip,
      personalTrackEnabled: isPersonalTrackEnabled(s.settings),
      progressCache: s.progressCache,
      isAppReady: s.isAppReady,
      dismissHalfDafTip: s.dismissHalfDafTip,
      activePersonalMasechet: s.activePersonalMasechet,
      personalTrackRecords: s.personalTrackRecords,
      setActivePersonalMasechet: s.setActivePersonalMasechet,
      clearActivePersonalMasechet: s.clearActivePersonalMasechet,
      togglePersonalDafLearned: s.togglePersonalDafLearned,
    })),
  );

  const {
    currentDate,
    currentDateStr,
    todayStr,
    isToday,
    isFuture,
    handlePrevDay,
    handleNextDay,
    handleTodayPress,
  } = useHomeDateNav();

  const studyStatus = getStudyStatus(todayRecord);
  const showHalfDafTip =
    dismissedHalfDafTip !== HALF_DAF_TIP_VERSION && studyStatus === 'none' && !isFuture;

  const masechetStats = useMemo(() => {
    const total = getMasechetDafim(todayMasechet).length;
    if (!progressCache) return { pct: 0, learned: 0, total };
    const progress = getMasechetProgressFromCache(progressCache, todayMasechet);
    const pct = total > 0 ? Math.round((progress.learned / total) * 100) : 0;
    return { pct, learned: progress.learned, total };
  }, [todayMasechet, progressCache]);

  const displayMasechetHe = useMemo(
    () => dafYomiDisplayMasechetHe(todayMasechet, todayDafNumValue),
    [todayMasechet, todayDafNumValue],
  );

  const sharedSubtitle = useMemo(
    () => kinnimTamidCalendarDisplay(todayMasechet, todayDafNumValue)?.subtitleHe,
    [todayMasechet, todayDafNumValue],
  );

  const partialAmud = getPartialAmud(todayRecord);
  const hDate = useMemo(() => new HDate(currentDate), [currentDate]);
  const hebrewDateStr = useMemo(() => hDate.renderGematriya(), [hDate]);
  const gregorianDateStr = useMemo(
    () => `${format(currentDate, 'EEEE', { locale: he })} · ${format(currentDate, 'dd/MM/yyyy')}`,
    [currentDate],
  );
  const eventName = useMemo(() => getHebrewDayEventInfo(hDate).eventName, [hDate]);

  const shasProgress = useMemo(() => {
    return progressCache?.totalShasProgress || { learnedCount: 0, totalPages: 2711, percentage: 0 };
  }, [progressCache]);

  const last7Days = useMemo(() => {
    const settings = useAppStore.getState().settings ?? {};
    return buildLast7Days(useAppStore.getState().history, getDafDayDate(new Date(), settings));
  }, [recentHistoryKey, todayStr]);

  const showYesterdayNudge =
    isToday &&
    nudgeDismissedFor !== todayStr &&
    shouldShowYesterdayNudge(
      useAppStore.getState().history,
      getDafDayDate(new Date(), useAppStore.getState().settings ?? {}),
    );

  return {
    todayRecord,
    todayMasechet,
    todayDafNum,
    todayMasechetEn,
    todayDafNumValue,
    todayAmud,
    streak,
    showSecularDate,
    personalTrackEnabled,
    isAppReady,
    dismissHalfDafTip,
    activePersonalMasechet,
    personalTrackRecords,
    setActivePersonalMasechet,
    clearActivePersonalMasechet,
    togglePersonalDafLearned,
    currentDate,
    currentDateStr,
    todayStr,
    isToday,
    isFuture,
    handlePrevDay,
    handleNextDay,
    handleTodayPress,
    studyStatus,
    showHalfDafTip,
    masechetStats,
    displayMasechetHe,
    sharedSubtitle,
    partialAmud,
    hebrewDateStr,
    gregorianDateStr,
    eventName,
    shasProgress,
    last7Days,
    showYesterdayNudge,
  };
}
