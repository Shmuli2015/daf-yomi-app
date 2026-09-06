import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';
import { getMasechetDafim } from '../utils/shas';
import { formatProgressCount } from '../utils/dafStatus';
import { PersonalTrackRecord } from '../db/database';

interface PersonalMasechetDetailModalProps {
  visible: boolean;
  masechetEn: string | null;
  personalTrackRecords: PersonalTrackRecord[];
  isHomeActive?: boolean;
  onToggleHomeActive?: () => void;
  onToggleDafLearned: (masechetEn: string, dafNum: number) => void;
  onOpenTzuratHadaf?: (masechetEn: string, dafNum: number) => void;
  onOpenPicker?: () => void;
  onClose: () => void;
}

export default function PersonalMasechetDetailModal({
  visible,
  masechetEn,
  personalTrackRecords,
  isHomeActive = false,
  onToggleHomeActive,
  onToggleDafLearned,
  onOpenTzuratHadaf,
  onOpenPicker,
  onClose,
}: PersonalMasechetDetailModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width: windowWidth } = useWindowDimensions();

  const masechet = useMemo(() => {
    if (!masechetEn) return null;
    return SHAS_MASECHTOT.find((m) => m.en === masechetEn) || null;
  }, [masechetEn]);

  const dafimArray = useMemo(() => {
    if (!masechet) return [];
    return getMasechetDafim(masechet.he);
  }, [masechet]);

  const learnedSet = useMemo(() => {
    if (!masechet) return new Set<number>();
    const recs = personalTrackRecords.filter(
      (r) => r.masechet === masechet.en && r.status === 'learned'
    );
    return new Set(recs.map((r) => r.daf_num));
  }, [masechet, personalTrackRecords]);

  if (!masechet) return null;

  const learnedCount = learnedSet.size;
  const totalCount = masechet.pages;
  const pct = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  const cellSize = Math.floor((windowWidth - 40 - 5 * 8) / 6);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.tagText}>לימוד אישי</Text>
              <Text style={styles.title}>מסכת {masechet.he}</Text>
            </View>

            <View style={styles.headerRightActions}>
              {onOpenPicker && (
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onOpenPicker();
                  }}
                  style={styles.switchMasechetBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-horizontal" size={16} color={theme.colors.accent} />
                  <Text style={styles.switchMasechetText}>החלף</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {`\u2066${formatProgressCount(learnedCount)} / ${totalCount}\u2069`}
              </Text>
              <Text style={styles.statLabel}>דפים שנלמדו</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{pct}%</Text>
              <Text style={styles.statLabel}>התקדמות במסכת</Text>
            </View>
            {onToggleHomeActive && (
              <>
                <View style={styles.statDivider} />
                <TouchableOpacity
                  style={[styles.homeToggleBtn, isHomeActive && styles.homeToggleBtnActive]}
                  onPress={onToggleHomeActive}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isHomeActive ? 'bookmark' : 'bookmark-outline'}
                    size={16}
                    color={isHomeActive ? '#FFF' : theme.colors.accent}
                  />
                  <Text style={[styles.homeToggleText, isHomeActive && styles.homeToggleTextActive]}>
                    {isHomeActive ? 'הסר ממסך הבית' : 'הצג במסך הבית'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.hintText}>
            לחץ על דף כדי לסמן כנלמד בלימוד אישי (הדף יצטרף להספק הש״ס וניתן ללמוד אותו גם בבוא יומו בדף היומי).
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.grid}>
              {dafimArray.map((dafNum) => {
                const isLearned = learnedSet.has(dafNum);
                const dafHe = numberToGematria(dafNum);

                return (
                  <TouchableOpacity
                    key={dafNum}
                    style={[
                      styles.dafCell,
                      { width: cellSize, height: cellSize },
                      isLearned ? styles.dafCellLearned : styles.dafCellDefault,
                    ]}
                    onPress={() => onToggleDafLearned(masechet.en, dafNum)}
                    onLongPress={() => onOpenTzuratHadaf?.(masechet.en, dafNum)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dafText,
                        isLearned ? styles.dafTextLearned : styles.dafTextDefault,
                      ]}
                    >
                      {dafHe}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      minHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    switchMasechetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.accentLight + '40',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    switchMasechetText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      marginBottom: 12,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 17,
      fontWeight: '900',
      color: theme.colors.accent,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: '60%',
      backgroundColor: theme.colors.border,
    },
    homeToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.accentLight + '40',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    homeToggleBtnActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    homeToggleText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    homeToggleTextActive: {
      color: '#FFF',
    },
    hintText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dafCell: {
      borderRadius: 14,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dafCellDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    dafCellLearned: {
      backgroundColor: theme.colors.accentLight,
      borderColor: 'rgba(201,150,60,0.4)',
    },
    dafText: {
      fontSize: 15,
      fontWeight: '800',
    },
    dafTextDefault: {
      color: theme.colors.textSecondary,
    },
    dafTextLearned: {
      color: theme.colors.accent,
    },
  });
