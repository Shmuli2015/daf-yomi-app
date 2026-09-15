import { useState, useMemo, useCallback } from 'react';
import { HDate } from '@hebcal/core';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../../store/useAppStore';
import { getStudyStatus, getPartialAmud } from '../../utils/dafStatus';
import { getDafByDate, getDateStr } from '../../utils/dafYomi';
import type { RootStackParamList } from '../../navigation/types';
import type { CatchUpItem } from './CatchUpModal';

interface UseCalendarActionsProps {
  currentHDate: HDate;
  setCurrentHDate: (hd: HDate) => void;
  animateGridChange: (direction: 'next' | 'prev', changeFn: () => void) => void;
  recordByDate: Map<string, any>;
  showConfettiSetting: boolean;
}

export function useCalendarActions({
  currentHDate,
  setCurrentHDate,
  animateGridChange,
  recordByDate,
  showConfettiSetting,
}: UseCalendarActionsProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const toggleAnyDafLearned = useAppStore((s) => s.toggleAnyDafLearned);
  const setDafStudyStatus = useAppStore((s) => s.setDafStudyStatus);
  const markPartialAmud = useAppStore((s) => s.markPartialAmud);
  const batchMarkDafim = useAppStore((s) => s.batchMarkDafim);

  const [selectedDate, setSelectedDate] = useState<HDate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCatchUpModal, setShowCatchUpModal] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const handleDayPress = useCallback((hd: HDate) => {
    setSelectedDate(hd);
    setModalVisible(true);

    const hdMonth = hd.getMonth();
    const hdYear = hd.getFullYear();
    const currentMonth = currentHDate.getMonth();
    const currentYear = currentHDate.getFullYear();

    if (hdMonth !== currentMonth || hdYear !== currentYear) {
      const direction = (hdYear > currentYear || (hdYear === currentYear && hdMonth > currentMonth))
        ? 'next'
        : 'prev';
      
      animateGridChange(direction, () => {
        setCurrentHDate(new HDate(1, hdMonth, hdYear));
      });
    }
  }, [currentHDate, animateGridChange, setCurrentHDate]);

  const selectedDafInfo = useMemo(() => {
    if (!selectedDate) return null;
    return getDafByDate(selectedDate.greg());
  }, [selectedDate]);

  const handleOpenTzuratHadaf = useCallback(() => {
    if (!selectedDafInfo) return;
    setModalVisible(false);
    navigation.navigate('TzuratHadaf', {
      masechetEn: selectedDafInfo.masechetEn,
      masechetHe: selectedDafInfo.masechet,
      dafNum: selectedDafInfo.dafNum,
      amud: selectedDafInfo.amud,
    });
  }, [navigation, selectedDafInfo]);

  const handlePrevDay = useCallback(() => {
    if (!selectedDate) return;
    const prev = selectedDate.prev();
    setSelectedDate(prev);
    if (
      prev.getMonth() !== currentHDate.getMonth() ||
      prev.getFullYear() !== currentHDate.getFullYear()
    ) {
      setCurrentHDate(new HDate(1, prev.getMonth(), prev.getFullYear()));
    }
  }, [selectedDate, currentHDate, setCurrentHDate]);

  const handleNextDay = useCallback(() => {
    if (!selectedDate) return;
    const next = selectedDate.next();
    setSelectedDate(next);
    if (
      next.getMonth() !== currentHDate.getMonth() ||
      next.getFullYear() !== currentHDate.getFullYear()
    ) {
      setCurrentHDate(new HDate(1, next.getMonth(), next.getFullYear()));
    }
  }, [selectedDate, currentHDate, setCurrentHDate]);

  const missedDaysUpToSelected = useMemo(() => {
    if (!selectedDate) return [];
    const selectedGreg = selectedDate.greg();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedGreg > today) return [];

    const missed: CatchUpItem[] = [];
    const pastDays: HDate[] = [];
    let cur = selectedDate;
    for (let i = 0; i < 14; i++) {
      pastDays.unshift(cur);
      cur = cur.prev();
    }
    for (const d of pastDays) {
      const dStr = getDateStr(d.greg());
      const rec = recordByDate.get(dStr);
      const status = getStudyStatus(rec);
      if (status !== 'learned') {
        const info = getDafByDate(d.greg());
        missed.push({
          dateStr: dStr,
          masechet: info.masechet,
          daf: info.daf,
          hebDateStr: d.renderGematriya().replace(/[\u0591-\u05C7]/g, ''),
        });
      }
    }
    return missed;
  }, [selectedDate, recordByDate]);

  const handleCatchUpConfirm = useCallback((selectedItems: CatchUpItem[]) => {
    if (selectedItems.length > 0) {
      if (showConfettiSetting) setShowConfetti(true);
      batchMarkDafim(
        selectedItems.map((item) => ({
          dateStr: item.dateStr,
          masechet: item.masechet,
          daf: item.daf,
        }))
      );
    }
    setShowCatchUpModal(false);
    setModalVisible(false);
  }, [showConfettiSetting, batchMarkDafim]);

  const handleToggleStudy = useCallback(() => {
    if (!selectedDate || !selectedDafInfo) return;
    const dateKey = getDateStr(selectedDate.greg());
    const currentStatus = getStudyStatus(recordByDate.get(dateKey));
    if (currentStatus === 'learned') {
      setShowConfirm(true);
    } else if (currentStatus === 'partial') {
      if (showConfettiSetting) setShowConfetti(true);
      setDafStudyStatus(dateKey, selectedDafInfo.masechet, selectedDafInfo.daf, 'learned');
      setModalVisible(false);
    } else {
      if (showConfettiSetting) setShowConfetti(true);
      toggleAnyDafLearned(dateKey, selectedDafInfo.masechet, selectedDafInfo.daf);
      setModalVisible(false);
    }
  }, [selectedDate, selectedDafInfo, recordByDate, showConfettiSetting, setDafStudyStatus, toggleAnyDafLearned]);

  const handleConfirmUnmark = useCallback(() => {
    if (selectedDate && selectedDafInfo) {
      toggleAnyDafLearned(getDateStr(selectedDate.greg()), selectedDafInfo.masechet, selectedDafInfo.daf);
    }
    setShowConfirm(false);
    setModalVisible(false);
  }, [selectedDate, selectedDafInfo, toggleAnyDafLearned]);

  const handleMarkMenuSelectFull = useCallback(() => {
    if (selectedDate && selectedDafInfo) {
      if (showConfettiSetting) setShowConfetti(true);
      setDafStudyStatus(
        getDateStr(selectedDate.greg()),
        selectedDafInfo.masechet,
        selectedDafInfo.daf,
        'learned',
      );
    }
    setShowMarkMenu(false);
    setModalVisible(false);
  }, [selectedDate, selectedDafInfo, showConfettiSetting, setDafStudyStatus]);

  const handleMarkMenuSelectHalf = useCallback((amud: 'a' | 'b') => {
    if (selectedDate && selectedDafInfo) {
      markPartialAmud(
        getDateStr(selectedDate.greg()),
        selectedDafInfo.masechet,
        selectedDafInfo.daf,
        amud,
      );
    }
    setShowMarkMenu(false);
    setModalVisible(false);
  }, [selectedDate, selectedDafInfo, markPartialAmud]);

  const handleMarkMenuUnmark = useCallback(() => {
    setShowMarkMenu(false);
    setShowConfirm(true);
  }, []);

  const currentStudyStatus = useMemo(() => {
    if (!selectedDate) return 'none';
    return getStudyStatus(recordByDate.get(getDateStr(selectedDate.greg())));
  }, [selectedDate, recordByDate]);

  const currentPartialAmud = useMemo(() => {
    if (!selectedDate) return null;
    return getPartialAmud(recordByDate.get(getDateStr(selectedDate.greg())));
  }, [selectedDate, recordByDate]);

  return {
    selectedDate,
    selectedDafInfo,
    modalVisible,
    setModalVisible,
    showConfirm,
    setShowConfirm,
    showCatchUpModal,
    setShowCatchUpModal,
    showMarkMenu,
    setShowMarkMenu,
    showConfetti,
    setShowConfetti,
    showMonthPicker,
    setShowMonthPicker,
    missedDaysUpToSelected,
    currentStudyStatus,
    currentPartialAmud,
    handleDayPress,
    handleOpenTzuratHadaf,
    handlePrevDay,
    handleNextDay,
    handleCatchUpConfirm,
    handleToggleStudy,
    handleConfirmUnmark,
    handleMarkMenuSelectFull,
    handleMarkMenuSelectHalf,
    handleMarkMenuUnmark,
  };
}
