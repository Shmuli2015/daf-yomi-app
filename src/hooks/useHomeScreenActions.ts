import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store/useAppStore';
import { getDafDayYesterday } from '../utils/dafDayBoundary';
import { SHAS_MASECHTOT } from '../data/shas';
import { triggerSelection } from '../utils/haptics';
import type { RootStackParamList, MainTabParamList } from '../navigation/types';

type UseHomeScreenActionsParams = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Home'>;
  todayMasechetEn: string;
  todayMasechet: string;
  todayDafNumValue: number;
  todayAmud: 'a' | 'b';
  partialAmud: 'a' | 'b' | null;
  activePersonalMasechet: string | null;
  detailMasechetEn: string | null;
  todayStr: string;
  setActivePersonalMasechet: (mEn: string | null) => void;
  clearActivePersonalMasechet: () => void;
  setDetailMasechetEn: (mEn: string | null) => void;
  openPersonalDetail: (mEn: string | null) => void;
  dismissNudgeForDay: (dayStr: string) => void;
  setShowConfetti: (show: boolean) => void;
};

export function useHomeScreenActions({
  navigation,
  todayMasechetEn,
  todayMasechet,
  todayDafNumValue,
  todayAmud,
  partialAmud,
  activePersonalMasechet,
  detailMasechetEn,
  todayStr,
  setActivePersonalMasechet,
  clearActivePersonalMasechet,
  setDetailMasechetEn,
  openPersonalDetail,
  dismissNudgeForDay,
  setShowConfetti,
}: UseHomeScreenActionsParams) {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleOpenTzuratHadaf = useCallback(() => {
    rootNavigation.navigate('TzuratHadaf', {
      masechetEn: todayMasechetEn,
      masechetHe: todayMasechet,
      dafNum: todayDafNumValue,
      amud: partialAmud === 'a' ? 'b' : todayAmud,
    });
  }, [rootNavigation, todayMasechetEn, todayMasechet, todayDafNumValue, todayAmud, partialAmud]);

  const handleOpenPersonalTzuratHadaf = useCallback(
    (masechetEn: string, dafNum: number) => {
      const match = SHAS_MASECHTOT.find((m) => m.en === masechetEn);
      rootNavigation.navigate('TzuratHadaf', {
        masechetEn,
        masechetHe: match ? match.he : masechetEn,
        dafNum,
        amud: 'a',
      });
    },
    [rootNavigation],
  );

  const handleOpenMasechet = useCallback(() => {
    navigation.navigate('History', {
      openMasechetEn: todayMasechetEn,
      returnToHomeOnClose: true,
    });
  }, [navigation, todayMasechetEn]);

  const handleOpenYesterday = useCallback(() => {
    const settings = useAppStore.getState().settings ?? {};
    useAppStore.getState().setCurrentDate(getDafDayYesterday(new Date(), settings));
  }, []);

  const handlePressShas = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const handleSelectDay = useCallback((date: Date) => {
    void triggerSelection();
    useAppStore.getState().setCurrentDate(date);
  }, []);

  const handleDismissNudge = useCallback(() => {
    dismissNudgeForDay(todayStr);
  }, [dismissNudgeForDay, todayStr]);

  const handleOpenActivePersonalDetail = useCallback(() => {
    openPersonalDetail(activePersonalMasechet);
  }, [activePersonalMasechet, openPersonalDetail]);

  const handleSelectPersonalMasechet = useCallback(
    (mEn: string | null) => {
      setActivePersonalMasechet(mEn);
      setDetailMasechetEn(mEn);
    },
    [setActivePersonalMasechet, setDetailMasechetEn],
  );

  const handleOpenPersonalMasechetDetail = useCallback(
    (mEn: string) => {
      openPersonalDetail(mEn);
    },
    [openPersonalDetail],
  );

  const handleToggleHomeActive = useCallback(() => {
    const current = detailMasechetEn || activePersonalMasechet;
    if (!current) return;
    if (activePersonalMasechet === current) {
      clearActivePersonalMasechet();
    } else {
      setActivePersonalMasechet(current);
    }
  }, [
    activePersonalMasechet,
    clearActivePersonalMasechet,
    detailMasechetEn,
    setActivePersonalMasechet,
  ]);

  const handleQuickJumpNavigate = useCallback(
    (params: {
      masechetEn: string;
      masechetHe: string;
      dafNum: number;
      amud: 'a' | 'b';
    }) => {
      rootNavigation.navigate('TzuratHadaf', {
        masechetEn: params.masechetEn,
        masechetHe: params.masechetHe,
        dafNum: params.dafNum,
        amud: params.amud,
      });
    },
    [rootNavigation],
  );

  const handleConfettiEnd = useCallback(() => {
    setShowConfetti(false);
  }, [setShowConfetti]);

  return {
    handleOpenTzuratHadaf,
    handleOpenPersonalTzuratHadaf,
    handleOpenMasechet,
    handleOpenYesterday,
    handlePressShas,
    handleSelectDay,
    handleDismissNudge,
    handleOpenActivePersonalDetail,
    handleSelectPersonalMasechet,
    handleOpenPersonalMasechetDetail,
    handleToggleHomeActive,
    handleQuickJumpNavigate,
    handleConfettiEnd,
  };
}
