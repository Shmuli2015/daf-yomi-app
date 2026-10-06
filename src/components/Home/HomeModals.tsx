import React from 'react';
import PersonalMasechetPickerModal from '../PersonalMasechetPickerModal';
import PersonalMasechetDetailModal from '../PersonalMasechetDetailModal';
import QuickJumpModal from '../QuickJump/QuickJumpModal';
import SiyumModal from '../Siyum/SiyumModal';
import GuideModal from '../Guide/GuideModal';
import type { GuideCategoryId } from '../Guide/guideCategories';
import type { GuideTabType } from '../Guide/GuideTabToggle';
import type { PersonalTrackRecord } from '../../db/database';

export type HomeModalsProps = {
  showPersonalPickerModal: boolean;
  showPersonalDetailModal: boolean;
  showQuickJumpModal: boolean;
  showSiyumModal: boolean;
  guideVisible: boolean;
  guideInitialTab?: GuideTabType;
  guideInitialCategory?: GuideCategoryId;
  detailMasechetEn: string | null;
  activePersonalMasechet: string | null;
  personalTrackRecords: PersonalTrackRecord[];
  todayMasechetEn: string;
  todayDafNumValue: number;
  todayAmud: 'a' | 'b';
  siyumMasechet: { he: string; pages: number } | null;
  onSelectPersonalMasechet: (mEn: string | null) => void;
  onOpenPersonalMasechetDetail: (mEn: string) => void;
  onClosePersonalPicker: () => void;
  onToggleHomeActive: () => void;
  onToggleDafLearned: (masechetEn: string, dafNum: number) => void;
  onOpenPersonalTzuratHadaf: (masechetEn: string, dafNum: number) => void;
  onOpenPicker: () => void;
  onClosePersonalDetail: () => void;
  onQuickJumpNavigate: (params: {
    masechetEn: string;
    masechetHe: string;
    dafNum: number;
    amud: 'a' | 'b';
  }) => void;
  onCloseQuickJump: () => void;
  onCloseGuide: () => void;
  onCloseSiyum: () => void;
};

export default function HomeModals({
  showPersonalPickerModal,
  showPersonalDetailModal,
  showQuickJumpModal,
  showSiyumModal,
  guideVisible,
  guideInitialTab,
  guideInitialCategory,
  detailMasechetEn,
  activePersonalMasechet,
  personalTrackRecords,
  todayMasechetEn,
  todayDafNumValue,
  todayAmud,
  siyumMasechet,
  onSelectPersonalMasechet,
  onOpenPersonalMasechetDetail,
  onClosePersonalPicker,
  onToggleHomeActive,
  onToggleDafLearned,
  onOpenPersonalTzuratHadaf,
  onOpenPicker,
  onClosePersonalDetail,
  onQuickJumpNavigate,
  onCloseQuickJump,
  onCloseGuide,
  onCloseSiyum,
}: HomeModalsProps) {
  const detailMasechet = detailMasechetEn || activePersonalMasechet;

  return (
    <>
      <PersonalMasechetPickerModal
        visible={showPersonalPickerModal}
        selectedMasechetEn={activePersonalMasechet}
        personalTrackRecords={personalTrackRecords}
        onSelectMasechet={onSelectPersonalMasechet}
        onOpenMasechetDetail={onOpenPersonalMasechetDetail}
        onClose={onClosePersonalPicker}
      />

      <PersonalMasechetDetailModal
        visible={showPersonalDetailModal}
        masechetEn={detailMasechet}
        personalTrackRecords={personalTrackRecords}
        isHomeActive={activePersonalMasechet === detailMasechet}
        onToggleHomeActive={onToggleHomeActive}
        onToggleDafLearned={onToggleDafLearned}
        onOpenTzuratHadaf={onOpenPersonalTzuratHadaf}
        onOpenPicker={onOpenPicker}
        onClose={onClosePersonalDetail}
      />

      <QuickJumpModal
        visible={showQuickJumpModal}
        initialMasechetEn={todayMasechetEn}
        initialDafNum={todayDafNumValue}
        initialAmud={todayAmud}
        onNavigate={onQuickJumpNavigate}
        onClose={onCloseQuickJump}
      />

      <GuideModal
        visible={guideVisible}
        onClose={onCloseGuide}
        initialTab={guideInitialTab}
        initialCategory={guideInitialCategory}
      />

      {siyumMasechet && (
        <SiyumModal
          visible={showSiyumModal}
          masechetHe={siyumMasechet.he}
          totalPages={siyumMasechet.pages}
          onClose={onCloseSiyum}
        />
      )}
    </>
  );
}
