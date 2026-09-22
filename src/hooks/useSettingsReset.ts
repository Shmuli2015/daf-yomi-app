import { useState, useMemo, useCallback } from 'react';
import type { ResetOptionType } from '../components/Settings/Modals/ResetOptionsModal.types';
import { getResetConfirmTexts, getResetSuccessFeedback, type ResetTexts } from '../utils/settingsReset';

interface UseSettingsResetParams {
  resetDafYomiState: () => void;
  resetPersonalTrackState: () => void;
  resetAllState: () => void;
}

export function useSettingsReset({
  resetDafYomiState,
  resetPersonalTrackState,
  resetAllState,
}: UseSettingsResetParams) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingResetType, setPendingResetType] = useState<ResetOptionType | null>(null);
  const [resetSuccessFeedback, setResetSuccessFeedback] = useState<ResetTexts | null>(null);

  const openResetModal = useCallback(() => setShowResetModal(true), []);
  const closeResetModal = useCallback(() => setShowResetModal(false), []);
  const closeSuccessModal = useCallback(() => setShowSuccessModal(false), []);

  const handleSelectResetOption = useCallback((type: ResetOptionType) => {
    setPendingResetType(type);
    setShowResetModal(false);
    setShowResetConfirmModal(true);
  }, []);

  const handleCancelResetConfirm = useCallback(() => {
    setShowResetConfirmModal(false);
    setPendingResetType(null);
  }, []);

  const handleExecuteReset = useCallback(() => {
    if (!pendingResetType) return;
    if (pendingResetType === 'dafYomi') {
      resetDafYomiState();
    } else if (pendingResetType === 'personalTrack') {
      resetPersonalTrackState();
    } else {
      resetAllState();
    }
    setResetSuccessFeedback(getResetSuccessFeedback(pendingResetType));
    setShowResetConfirmModal(false);
    setPendingResetType(null);
    setShowSuccessModal(true);
  }, [pendingResetType, resetDafYomiState, resetPersonalTrackState, resetAllState]);

  const resetConfirmTexts = useMemo(() => getResetConfirmTexts(pendingResetType), [pendingResetType]);

  return {
    showResetModal,
    showResetConfirmModal,
    showSuccessModal,
    resetConfirmTexts,
    resetSuccessFeedback,
    openResetModal,
    closeResetModal,
    closeSuccessModal,
    handleSelectResetOption,
    handleCancelResetConfirm,
    handleExecuteReset,
  };
}
