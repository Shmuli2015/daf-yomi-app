import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Dimensions } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MasechetModalProps {
  masechet: typeof SHAS_MASECHTOT[0];
  onClose: () => void;
}

export default function MasechetModal({
  masechet,
  onClose,
}: MasechetModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const history = useAppStore(state => state.history);
  const progressCache = useAppStore(state => state.progressCache);
  const toggleAnyDafLearned = useAppStore(state => state.toggleAnyDafLearned);
  const [showConfetti, setShowConfetti] = useState(false);

  const dafimArray = useMemo(() => getMasechetDafim(masechet.he), [masechet.he]);

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

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
        <View style={styles.modalHandle} />

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>מסכת {stripNiqqud(masechet.he)}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>סגור</Text>
          </TouchableOpacity>
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
              origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
              fadeOut={true}
              fallSpeed={3500}
              onAnimationEnd={() => setShowConfetti(false)}
            />
          </View>
        )}
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
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    modalTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
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
