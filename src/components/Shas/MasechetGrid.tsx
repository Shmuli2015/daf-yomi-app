import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAppStore } from '../../store/useAppStore';
import { SHAS_MASECHTOT, numberToGematria } from '../../data/shas';
import { getMasechetProgress, getDafDateStr, isDafLearnedByDate, getMasechetDafim } from '../../utils/shas';
import { THEME } from '../../theme';

function stripNiqqud(s: string) {
  return s.replace(/[\u0591-\u05C7]/g, '');
}

interface MasechetData {
  m: typeof SHAS_MASECHTOT[0];
  total: number;
  learned: number;
  percent: number;
  isCompleted: boolean;
}

function MasechetCard({
  data,
  index,
  onPress,
}: {
  data: MasechetData;
  index: number;
  onPress: () => void;
}) {
  const progressWidth = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const delay = index * 22;
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 360, delay, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: 360, delay, useNativeDriver: true }),
    ]).start();

    Animated.timing(progressWidth, {
      toValue: data.percent / 100,
      duration: 900,
      delay: 400 + delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [data.percent]);

  const barWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[styles.cardWrapper, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}
    >
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onPress}
        style={[styles.card, data.isCompleted ? styles.cardCompleted : styles.cardDefault]}
      >
        {data.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
        <Text style={styles.masechetName}>{stripNiqqud(data.m.he)}</Text>
        <Text style={styles.progressText}>{data.learned} / {data.total} דפים</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              data.isCompleted ? styles.progressFillCompleted : styles.progressFillDefault,
              { width: barWidth },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MasechetGrid() {
  const { history } = useAppStore();
  const [selectedMasechet, setSelectedMasechet] = useState<typeof SHAS_MASECHTOT[0] | null>(null);

  const masechetData: MasechetData[] = SHAS_MASECHTOT.map(m => {
    const total = getMasechetDafim(m.he).length;
    const learned = getMasechetProgress(m.he, history);
    const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { m, total, learned, percent, isCompleted: total > 0 && learned === total };
  }).filter(d => d.total > 0);

  return (
    <View style={styles.container}>
      <View style={styles.gridRow}>
        {masechetData.map((data, index) => (
          <MasechetCard
            key={data.m.en}
            data={data}
            index={index}
            onPress={() => setSelectedMasechet(data.m)}
          />
        ))}
      </View>

      {selectedMasechet && (
        <MasechetModal masechet={selectedMasechet} onClose={() => setSelectedMasechet(null)} />
      )}
    </View>
  );
}

function MasechetModal({
  masechet,
  onClose,
}: {
  masechet: typeof SHAS_MASECHTOT[0];
  onClose: () => void;
}) {
  const { history, toggleAnyDafLearned } = useAppStore();
  const [showConfetti, setShowConfetti] = useState(false);

  const dafimArray = getMasechetDafim(masechet.he);

  const handleToggleDaf = (dafNum: number) => {
    const dateStr = getDafDateStr(masechet.he, dafNum);
    if (!dateStr) return;

    const isCurrentlyLearned = isDafLearnedByDate(dateStr, history);
    const learnedBefore = getMasechetProgress(masechet.he, history);
    const dafHeStr = `דף ${numberToGematria(dafNum)}`;
    toggleAnyDafLearned(dateStr, masechet.he, dafHeStr);

    if (!isCurrentlyLearned && learnedBefore + 1 === dafimArray.length) {
      setTimeout(() => setShowConfetti(true), 200);
    }
  };

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
          <ConfettiCannon
            count={180}
            origin={{ x: 200, y: 0 }}
            fadeOut={true}
            fallSpeed={3500}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: { width: '48%', marginBottom: 12 },
  card: { borderRadius: 20, padding: 16, borderWidth: 1 },
  cardDefault: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: THEME.colors.accentLight,
    borderColor: 'rgba(201,150,60,0.35)',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: { color: 'white', fontSize: 11, fontWeight: '900' },
  masechetName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
  },
  progressTrack: {
    height: 5,
    backgroundColor: THEME.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    right: 0,
    height: '100%',
    borderRadius: 3,
  },
  progressFillDefault: { backgroundColor: THEME.colors.accent },
  progressFillCompleted: { backgroundColor: THEME.colors.accent },
  // Modal
  modalSafe: { flex: 1, backgroundColor: THEME.colors.background },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: THEME.colors.primary },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  closeBtnText: { color: THEME.colors.accent, fontWeight: '700', fontSize: 14 },
  modalScroll: { flex: 1 },
  modalContent: { padding: 20 },
  dafGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  dafCell: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dafCellDefault: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
  },
  dafCellLearned: {
    backgroundColor: THEME.colors.accentLight,
    borderColor: 'rgba(201,150,60,0.4)',
  },
  dafText: { fontSize: 15, fontWeight: '800' },
  dafTextDefault: { color: THEME.colors.textSecondary },
  dafTextLearned: { color: THEME.colors.accent },
});
