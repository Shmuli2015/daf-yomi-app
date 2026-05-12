import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, BackHandler, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, numberToGematria } from '../../data/shas';
import { 
  getDafDateStr, 
  isDafLearnedByDate, 
  getMasechetDafim,
  stripNiqqud 
} from '../../utils/shas';
import { getMasechetProgressFromCache } from '../../utils/progressCache';
import { useTheme } from '../../theme';
import BulkActionConfirmOverlay from './BulkActionConfirmOverlay';
import FullscreenLoadingOverlay from './FullscreenLoadingOverlay';

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

  const history = useAppStore(state => state.history);
  const progressCache = useAppStore(state => state.progressCache);
  const toggleAnyDafLearned = useAppStore(state => state.toggleAnyDafLearned);
  const batchMarkDafim = useAppStore(state => state.batchMarkDafim);
  const batchUnmarkDafim = useAppStore(state => state.batchUnmarkDafim);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingAction, setPendingAction] = useState<'markAll' | 'unmarkAll' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dafimArray = useMemo(() => getMasechetDafim(masechet.he), [masechet.he]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    
    return () => backHandler.remove();
  }, [onClose]);

  const handleToggleDaf = useCallback((dafNum: number) => {
    const dateStr = getDafDateStr(masechet.he, dafNum);
    if (!dateStr) return;

    const isCurrentlyLearned = isDafLearnedByDate(dateStr, history);
    const learnedBefore = progressCache 
      ? getMasechetProgressFromCache(progressCache, masechet.he).learned 
      : 0;
    const dafHeStr = `דף ${numberToGematria(dafNum)}`;
    toggleAnyDafLearned(dateStr, masechet.he, dafHeStr);

    if (!isCurrentlyLearned && learnedBefore + 1 === dafimArray.length) {
      setTimeout(() => setShowConfetti(true), 200);
    }
  }, [masechet.he, history, progressCache, dafimArray.length, toggleAnyDafLearned]);

  const handleMarkAll = useCallback(() => {
    const updates = dafimArray
      .map(dafNum => {
        const dateStr = getDafDateStr(masechet.he, dafNum);
        if (!dateStr) return null;

        const isLearned = isDafLearnedByDate(dateStr, history);
        if (isLearned) return null;

        return {
          dateStr,
          masechet: masechet.he,
          daf: `דף ${numberToGematria(dafNum)}`,
        };
      })
      .filter((update): update is { dateStr: string; masechet: string; daf: string } => update !== null);

    if (updates.length > 0) {
      batchMarkDafim(updates);
      setTimeout(() => setShowConfetti(true), 200);
    }
  }, [masechet.he, dafimArray, history, batchMarkDafim]);

  const handleUnmarkAll = useCallback(() => {
    const updates = dafimArray
      .map(dafNum => {
        const dateStr = getDafDateStr(masechet.he, dafNum);
        if (!dateStr) return null;

        const isLearned = isDafLearnedByDate(dateStr, history);
        if (!isLearned) return null;

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
  }, [masechet.he, dafimArray, history, batchUnmarkDafim]);

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
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
        <View style={styles.modalHandle} />

        <View style={styles.modalHeaderContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>מסכת {stripNiqqud(masechet.he)}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>סגור</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleMarkAllPress} style={styles.markAllBtn} activeOpacity={0.7}>
              <Text style={styles.markAllBtnText}>סמן הכל</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUnmarkAllPress} style={styles.unmarkAllBtn} activeOpacity={0.7}>
              <Text style={styles.unmarkAllBtnText}>בטל הכל</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
          <View style={styles.dafGrid}>
            {dafimArray.map(dafNum => {
              const dateStr = getDafDateStr(masechet.he, dafNum);
              const isLearned = dateStr ? isDafLearnedByDate(dateStr, history) : false;
              return (
                <TouchableOpacity
                  key={dafNum}
                  activeOpacity={0.7}
                  onPress={() => handleToggleDaf(dafNum)}
                  style={[styles.dafCell, isLearned ? styles.dafCellLearned : styles.dafCellDefault]}
                >
                  <Text style={[styles.dafText, isLearned ? styles.dafTextLearned : styles.dafTextDefault]}>
                    {numberToGematria(dafNum)}
                  </Text>
                </TouchableOpacity>
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
      paddingTop: 16,
      paddingBottom: 12,
    },
    modalTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
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
    closeBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtnText: { color: theme.colors.accent, fontWeight: '700', fontSize: 14 },
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
    dafText: { fontSize: 15, fontWeight: '800' },
    dafTextDefault: { color: theme.colors.textSecondary },
    dafTextLearned: { color: theme.colors.accent },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      // @ts-ignore
      direction: 'ltr',
    },
  });
