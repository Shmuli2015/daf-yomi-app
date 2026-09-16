import { useState, useCallback } from 'react';

export function useHomeScreenModals() {
  const [showPersonalPickerModal, setShowPersonalPickerModal] = useState(false);
  const [showPersonalDetailModal, setShowPersonalDetailModal] = useState(false);
  const [showQuickJumpModal, setShowQuickJumpModal] = useState(false);
  const [detailMasechetEn, setDetailMasechetEn] = useState<string | null>(null);
  const [nudgeDismissedFor, setNudgeDismissedFor] = useState<string | null>(null);

  const openPersonalPicker = useCallback(() => {
    setShowPersonalPickerModal(true);
  }, []);

  const closePersonalPicker = useCallback(() => {
    setShowPersonalPickerModal(false);
  }, []);

  const openPersonalDetail = useCallback((masechetEn: string | null) => {
    setDetailMasechetEn(masechetEn);
    setShowPersonalDetailModal(true);
  }, []);

  const closePersonalDetail = useCallback(() => {
    setShowPersonalDetailModal(false);
  }, []);

  const openQuickJump = useCallback(() => {
    setShowQuickJumpModal(true);
  }, []);

  const closeQuickJump = useCallback(() => {
    setShowQuickJumpModal(false);
  }, []);

  const dismissNudgeForDay = useCallback((dayStr: string) => {
    setNudgeDismissedFor(dayStr);
  }, []);

  return {
    showPersonalPickerModal,
    showPersonalDetailModal,
    showQuickJumpModal,
    detailMasechetEn,
    nudgeDismissedFor,
    setDetailMasechetEn,
    openPersonalPicker,
    closePersonalPicker,
    openPersonalDetail,
    closePersonalDetail,
    openQuickJump,
    closeQuickJump,
    dismissNudgeForDay,
  };
}
