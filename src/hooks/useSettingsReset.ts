import { useState, useMemo, useCallback } from 'react';
import type { ResetOptionType } from '../components/Settings/Modals/ResetOptionsModal.types';
import type { SettingsFeedback } from './useSettingsFeedback';
import { getResetConfirmTexts, getResetSuccessToast, runResetAction } from '../utils/settingsReset';

interface UseSettingsResetParams {
  resetDafYomiState: () => void;
  resetPersonalTrackState: () => void;
  clearReaderPositionsState: () => void;
  clearSavedTextsState: () => void | Promise<void>;
  resetAllState: () => void;
  onFeedback: (feedback: SettingsFeedback) => void;
}

export function useSettingsReset({
  resetDafYomiState,
  resetPersonalTrackState,
  clearReaderPositionsState,
  clearSavedTextsState,
  resetAllState,
  onFeedback,
}: UseSettingsResetParams) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingResetType, setPendingResetType] = useState<ResetOptionType | null>(null);

  const openResetModal = useCallback(() => setShowResetModal(true), []);
  const closeResetModal = useCallback(() => setShowResetModal(false), []);

  const handleSelectResetOption = useCallback((type: ResetOptionType) => {
    setPendingResetType(type);
    setShowResetModal(false);
    setShowResetConfirmModal(true);
  }, []);

  const handleCancelResetConfirm = useCallback(() => {
    setShowResetConfirmModal(false);
    setPendingResetType(null);
  }, []);

  const handleExecuteReset = useCallback(async () => {
    if (!pendingResetType) return;
    try {
      await runResetAction(pendingResetType, {
        resetDafYomiState,
        resetPersonalTrackState,
        clearReaderPositionsState,
        clearSavedTextsState,
        resetAllState,
      });
      onFeedback(getResetSuccessToast(pendingResetType));
    } catch {
      onFeedback({
        title: 'הפעולה נכשלה',
        message: 'לא הצלחנו להשלים את המחיקה. נסו שוב.',
        iconName: 'alert-circle-outline',
        compact: true,
      });
    } finally {
      setShowResetConfirmModal(false);
      setPendingResetType(null);
    }
  }, [
    pendingResetType,
    resetDafYomiState,
    resetPersonalTrackState,
    clearReaderPositionsState,
    clearSavedTextsState,
    resetAllState,
    onFeedback,
  ]);

  const resetConfirmTexts = useMemo(() => getResetConfirmTexts(pendingResetType), [pendingResetType]);

  return {
    showResetModal,
    showResetConfirmModal,
    resetConfirmTexts,
    openResetModal,
    closeResetModal,
    handleSelectResetOption,
    handleCancelResetConfirm,
    handleExecuteReset,
  };
}
