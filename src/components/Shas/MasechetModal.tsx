import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, numberToGematria } from '../../data/shas';
import {
  getDafDateStr,
  getMasechetDafim,
  stripNiqqud,
} from '../../utils/shas';
import { getStudyStatus } from '../../utils/dafStatus';
import { getMasechetProgressFromCache } from '../../utils/progressCache';
import { useTheme } from '../../theme';
import BulkActionConfirmOverlay from './BulkActionConfirmOverlay';
import FullscreenLoadingOverlay from './FullscreenLoadingOverlay';
import DafCell from './DafCell';
import MasechetModalModeToggle, { type MasechetStudyMode } from './MasechetModalModeToggle';
import MasechetModalStats from './MasechetModalStats';

interface MasechetModalProps {
  masechet: typeof SHAS_MASECHTOT[0];
  onClose: () => void;
}

export default function MasechetModal({
  masechet,
  onClose,
}: MasechetModalProps) {
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mode, setMode] = useState<MasechetStudyMode>('dafYomi');

  const {
    history,
    progressCache,
    toggleAnyDafLearned,
    setDafStudyStatus,
    batchMarkDafim,
    batchUnmarkDafim,
    personalTrackRecords,
    togglePersonalDafLearned,
    activePersonalMasechet,
    setActivePersonalMasechet,
    clearActivePersonalMasechet,
    settings,
  } = useAppStore(
    useShallow((s) => ({
      history: s.history,
      progressCache: s.progressCache,
      toggleAnyDafLearned: s.toggleAnyDafLearned,
      setDafStudyStatus: s.setDafStudyStatus,
      batchMarkDafim: s.batchMarkDafim,
      batchUnmarkDafim: s.batchUnmarkDafim,
      personalTrackRecords: s.personalTrackRecords,
      togglePersonalDafLearned: s.togglePersonalDafLearned,
      activePersonalMasechet: s.activePersonalMasechet,
      setActivePersonalMasechet: s.setActivePersonalMasechet,
      clearActivePersonalMasechet: s.clearActivePersonalMasechet,
      settings: s.settings,
    })),
  );

  const recordByDate = useMemo(() => new Map(history.map((r) => [r.date, r])), [history]);
  const personalLearnedSet = useMemo(() => {
    const recs = personalTrackRecords.filter(
      (r) => r.masechet === masechet.en && r.status === 'learned'
    );
    return new Set(recs.map((r) => r.daf_num));
  }, [masechet.en, personalTrackRecords]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingAction, setPendingAction] = useState<'markAll' | 'unmarkAll' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dafimArray = useMemo(() => getMasechetDafim(masechet.he), [masechet.he]);

  const masechetStats = useMemo(() => {
    if (!progressCache) {
      return { learned: 0, total: masechet.pages, dafYomiLearned: 0, personalLearned: 0 };
    }
    return getMasechetProgressFromCache(progressCache, masechet.he);
  }, [progressCache, masechet.he, masechet.pages]);

  const pct = masechetStats.total > 0
    ? Math.round((masechetStats.learned / masechetStats.total) * 100)
    : 0;

  const isHomeActive = activePersonalMasechet === masechet.en;
  const handleToggleHomeActive = useCallback(() => {
    if (isHomeActive) {
      clearActivePersonalMasechet();
    } else {
      setActivePersonalMasechet(masechet.en);
    }
  }, [isHomeActive, masechet.en, clearActivePersonalMasechet, setActivePersonalMasechet]);

  const handleRequestClose = useCallback(() => {
    if (pendingAction !== null) {
      setPendingAction(null);
      return;
    }
    onClose();
  }, [pendingAction, onClose]);

  const isPersonalTrackEnabled = (settings?.show_personal_track_banner ?? 1) !== 0;
  const effectiveMode = isPersonalTrackEnabled ? mode : 'dafYomi';

  const handleToggleDaf = useCallback((dafNum: number) => {
    if (effectiveMode === 'personal') {
      togglePersonalDafLearned(masechet.en, dafNum);
      return;
    }

    const dateStr = getDafDateStr(masechet.he, dafNum);
    if (!dateStr) return;

    const currentStatus = getStudyStatus(recordByDate.get(dateStr));
    const learnedBefore = progressCache
      ? getMasechetProgressFromCache(progressCache, masechet.he).learned
      : 0;
    const dafHeStr = `דף ${numberToGematria(dafNum)}`;

    if (currentStatus === 'partial') {
      setDafStudyStatus(dateStr, masechet.he, dafHeStr, 'learned');
    } else {
      toggleAnyDafLearned(dateStr, masechet.he, dafHeStr);
    }

    if (currentStatus !== 'learned' && learnedBefore + 1 === dafimArray.length && settings?.show_confetti) {
      setTimeout(() => setShowConfetti(true), 200);
    }
  }, [effectiveMode, masechet.en, masechet.he, togglePersonalDafLearned, recordByDate, progressCache, dafimArray.length, toggleAnyDafLearned, setDafStudyStatus, settings]);

  const handleToggleDafRef = useRef(handleToggleDaf);
  handleToggleDafRef.current = handleToggleDaf;

  const handleToggleDafStable = useCallback((dafNum: number) => {
    handleToggleDafRef.current(dafNum);
  }, []);

  const handleMarkAll = useCallback(() => {
    if (effectiveMode === 'personal') {
      for (const dafNum of dafimArray) {
        if (!personalLearnedSet.has(dafNum)) {
          togglePersonalDafLearned(masechet.en, dafNum);
        }
      }
      return;
    }

    const updates = dafimArray
      .map(dafNum => {
        const dateStr = getDafDateStr(masechet.he, dafNum);
        if (!dateStr) return null;

        if (getStudyStatus(recordByDate.get(dateStr)) === 'learned') return null;

        return {
          dateStr,
          masechet: masechet.he,
          daf: `דף ${numberToGematria(dafNum)}`,
        };
      })
      .filter((update): update is { dateStr: string; masechet: string; daf: string } => update !== null);

    if (updates.length > 0) {
      batchMarkDafim(updates);
      if (settings?.show_confetti) setTimeout(() => setShowConfetti(true), 200);
    }
  }, [effectiveMode, masechet.en, masechet.he, dafimArray, personalLearnedSet, togglePersonalDafLearned, recordByDate, batchMarkDafim, settings]);

  const handleUnmarkAll = useCallback(() => {
    if (effectiveMode === 'personal') {
      for (const dafNum of dafimArray) {
        if (personalLearnedSet.has(dafNum)) {
          togglePersonalDafLearned(masechet.en, dafNum);
        }
      }
      return;
    }

    const updates = dafimArray
      .map(dafNum => {
        const dateStr = getDafDateStr(masechet.he, dafNum);
        if (!dateStr) return null;

        const status = getStudyStatus(recordByDate.get(dateStr));
        if (status === 'none') return null;

        return {
          dateStr,
          masechet: masechet.he,
          daf: `דף ${numberToGematria(dafNum)}`,
        };
      })
      .filter((update): update is { dateStr: string; masechet: string; daf: string } => update !== null);

    if (updates.length > 0) {
      batchUnmarkDafim(updates);
    }
  }, [effectiveMode, masechet.en, masechet.he, dafimArray, personalLearnedSet, togglePersonalDafLearned, recordByDate, batchUnmarkDafim]);

  const handleMarkAllPress = () => setPendingAction('markAll');
  const handleUnmarkAllPress = () => setPendingAction('unmarkAll');

  const handleConfirm = () => {
    const action = pendingAction;
    setIsLoading(true);
    setPendingAction(null);
    
    setTimeout(() => {
      try {
        if (action === 'markAll') {
          handleMarkAll();
        } else if (action === 'unmarkAll') {
          handleUnmarkAll();
        }
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  const handleCancel = () => setPendingAction(null);

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleRequestClose}
    >
      <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
        <View style={styles.modalHandle} />

        <View style={styles.modalHeaderContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              מסכת {stripNiqqud(masechet.he)}
            </Text>
            <View style={styles.headerActions}>
              {isPersonalTrackEnabled && (
                <TouchableOpacity
                  onPress={handleToggleHomeActive}
                  style={[styles.homeActionBtn, isHomeActive && styles.homeActionBtnActive]}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isHomeActive ? 'bookmark' : 'bookmark-outline'}
                    size={14}
                    color={isHomeActive ? '#FFF' : theme.colors.accent}
                  />
                  <Text style={[styles.homeActionText, isHomeActive && styles.homeActionTextActive]}>
                    {isHomeActive ? 'הסר מהבית' : 'הצג בבית'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isPersonalTrackEnabled && (
            <MasechetModalModeToggle
              mode={effectiveMode}
              onModeChange={setMode}
              dafYomiCount={masechetStats.dafYomiLearned}
              personalCount={masechetStats.personalLearned}
            />
          )}

          <MasechetModalStats
            totalLearned={masechetStats.learned}
            totalPages={masechetStats.total}
            percentage={pct}
            showPersonalTrack={isPersonalTrackEnabled}
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleMarkAllPress} style={styles.markAllBtn} activeOpacity={0.7}>
              <Text style={styles.markAllBtnText}>
                {effectiveMode === 'personal' ? 'סמן הכל באישי' : 'סמן הכל'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUnmarkAllPress} style={styles.unmarkAllBtn} activeOpacity={0.7}>
              <Text style={styles.unmarkAllBtnText}>
                {effectiveMode === 'personal' ? 'בטל הכל באישי' : 'בטל הכל'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
          <View style={styles.dafGrid}>
            {dafimArray.map(dafNum => {
              const dateStr = getDafDateStr(masechet.he, dafNum);
              const studyStatus = dateStr ? getStudyStatus(recordByDate.get(dateStr)) : 'none';
              const isPersonal = isPersonalTrackEnabled && personalLearnedSet.has(dafNum);
              return (
                <DafCell
                  key={dafNum}
                  dafNum={dafNum}
                  isLearned={studyStatus === 'learned'}
                  isPartial={studyStatus === 'partial'}
                  isPersonalLearned={isPersonal}
                  mode={effectiveMode}
                  onPress={handleToggleDafStable}
                  styles={styles}
                />
              );
            })}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>

        {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            <ConfettiCannon
              count={180}
              origin={{ x: windowWidth / 2, y: -20 }}
              fadeOut={true}
              fallSpeed={3500}
              onAnimationEnd={() => setShowConfetti(false)}
            />
          </View>
        )}

        <BulkActionConfirmOverlay
          variant={pendingAction}
          dafCount={dafimArray.length}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />

        <FullscreenLoadingOverlay visible={isLoading} />
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    modalSafe: { flex: 1, backgroundColor: theme.colors.background },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    modalHeaderContainer: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
      flexShrink: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    homeActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight + '40',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    homeActionBtnActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    homeActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    homeActionTextActive: {
      color: '#FFF',
    },
    closeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtnText: { color: theme.colors.accent, fontWeight: '700', fontSize: 13 },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    markAllBtn: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: theme.colors.accentLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      alignItems: 'center',
    },
    markAllBtnText: { color: theme.colors.accent, fontWeight: '700', fontSize: 14 },
    unmarkAllBtn: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    unmarkAllBtnText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 14 },
    modalScroll: { flex: 1 },
    modalContent: { padding: 20 },
    dafGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    dafCell: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1.5,
    },
    dafCellDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    dafCellLearned: {
      backgroundColor: theme.colors.accentLight,
      borderColor: 'rgba(201,150,60,0.4)',
    },
    dafCellPersonalLearned: {
      backgroundColor: theme.colors.accent + '20',
      borderColor: theme.colors.accent,
    },
    dafCellPartial: {
      backgroundColor: theme.colors.accent + '25',
      borderColor: theme.colors.accent + '70',
    },
    dafCornerDot: {
      position: 'absolute',
      top: 3,
      left: 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.accent,
    },
    dafCornerStar: {
      position: 'absolute',
      top: 3,
      left: 3,
    },
    dafText: { fontSize: 15, fontWeight: '800' },
    dafTextDefault: { color: theme.colors.textSecondary },
    dafTextLearned: { color: theme.colors.accent },
    dafTextPersonalLearned: { color: theme.colors.accent },
    dafTextPartial: { color: theme.colors.accent },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      direction: 'ltr',
    },
  });
