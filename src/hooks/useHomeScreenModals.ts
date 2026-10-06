import { useState, useCallback } from 'react';
import type { GuideCategoryId } from '../components/Guide/guideCategories';
import type { GuideTabType } from '../components/Guide/GuideTabToggle';

type GuideModalConfig = {
  visible: boolean;
  initialTab?: GuideTabType;
  initialCategory?: GuideCategoryId;
};

export function useHomeScreenModals() {
  const [showPersonalPickerModal, setShowPersonalPickerModal] = useState(false);
  const [showPersonalDetailModal, setShowPersonalDetailModal] = useState(false);
  const [showQuickJumpModal, setShowQuickJumpModal] = useState(false);
  const [detailMasechetEn, setDetailMasechetEn] = useState<string | null>(null);
  const [nudgeDismissedFor, setNudgeDismissedFor] = useState<string | null>(null);
  const [guideModalConfig, setGuideModalConfig] = useState<GuideModalConfig>({
    visible: false,
  });

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

  const openHeroGuide = useCallback(() => {
    setGuideModalConfig({ visible: true, initialTab: 'guide' });
  }, []);

  const openPersonalGuide = useCallback(() => {
    setGuideModalConfig({ visible: true, initialTab: 'faq', initialCategory: 'marking' });
  }, []);

  const closeGuide = useCallback(() => {
    setGuideModalConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    showPersonalPickerModal,
    showPersonalDetailModal,
    showQuickJumpModal,
    detailMasechetEn,
    nudgeDismissedFor,
    guideModalConfig,
    setDetailMasechetEn,
    openPersonalPicker,
    closePersonalPicker,
    openPersonalDetail,
    closePersonalDetail,
    openQuickJump,
    closeQuickJump,
    dismissNudgeForDay,
    openHeroGuide,
    openPersonalGuide,
    closeGuide,
  };
}
