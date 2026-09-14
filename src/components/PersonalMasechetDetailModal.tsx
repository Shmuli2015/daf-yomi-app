import React, { useMemo, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';
import { getMasechetDafim } from '../utils/shas';
import { formatProgressCount } from '../utils/dafStatus';
import { useAppStore } from '../store/useAppStore';
import DafMarkMenuModal from './DafMarkMenuModal';
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
  const markPersonalPartialAmud = useAppStore((s) => s.markPersonalPartialAmud);
  const setPersonalDafStudyStatus = useAppStore((s) => s.setPersonalDafStudyStatus);
  const [selectedDafForMenu, setSelectedDafForMenu] = useState<number | null>(null);

  const masechet = useMemo(() => {
    if (!masechetEn) return null;
    return SHAS_MASECHTOT.find((m) => m.en === masechetEn) || null;
  }, [masechetEn]);

  const dafimArray = useMemo(() => {
    if (!masechet) return [];
    return getMasechetDafim(masechet.he);
  }, [masechet]);

  const masechetRecords = useMemo(() => {
    if (!masechet) return [];
    return personalTrackRecords.filter((r) => r.masechet === masechet.en);
  }, [masechet, personalTrackRecords]);

  const learnedSet = useMemo(() => {
    return new Set(
      masechetRecords.filter((r) => r.status === 'learned').map((r) => r.daf_num)
    );
  }, [masechetRecords]);

  const partialMap = useMemo(() => {
    const map = new Map<number, PersonalTrackRecord>();
    for (const r of masechetRecords) {
      if (r.status === 'partial') {
        map.set(r.daf_num, r);
      }
    }
    return map;
  }, [masechetRecords]);

  const learnedCount = useMemo(() => {
    return masechetRecords.reduce(
      (sum, r) => sum + (r.status === 'learned' ? 1 : r.status === 'partial' ? 0.5 : 0),
      0
    );
  }, [masechetRecords]);

  if (!masechet) return null;

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
            לחץ על דף כדי לסמן כנלמד. לחיצה ארוכה תפתח אפשרויות לסימון חצי דף או פתיחה בצורת הדף.
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.grid}>
              {dafimArray.map((dafNum) => {
                const isLearned = learnedSet.has(dafNum);
                const partialRec = partialMap.get(dafNum);
                const isPartial = partialRec != null;
                const dafHe = numberToGematria(dafNum);
                const amudText = partialRec?.amud === 'a' ? 'א׳' : partialRec?.amud === 'b' ? 'ב׳' : '';

                const cellStyle = isLearned
                  ? styles.dafCellLearned
                  : isPartial
                  ? styles.dafCellPartial
                  : styles.dafCellDefault;

                const textStyle = isLearned
                  ? styles.dafTextLearned
                  : isPartial
                  ? styles.dafTextPartial
                  : styles.dafTextDefault;

                return (
                  <TouchableOpacity
                    key={dafNum}
                    style={[
                      styles.dafCell,
                      { width: cellSize, height: cellSize },
                      cellStyle,
                    ]}
                    onPress={() => onToggleDafLearned(masechet.en, dafNum)}
                    onLongPress={() => setSelectedDafForMenu(dafNum)}
                    activeOpacity={0.7}
                  >
                    {isPartial && amudText ? (
                      <View style={styles.dafCornerBadge}>
                        <Text style={styles.dafCornerBadgeText}>{amudText}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.dafText, textStyle]}>
                      {dafHe}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {selectedDafForMenu !== null && (
        <DafMarkMenuModal
          visible={selectedDafForMenu !== null}
          partialAmud={selectedDafForMenu ? partialMap.get(selectedDafForMenu)?.amud || null : null}
          showUnmark={
            selectedDafForMenu
              ? learnedSet.has(selectedDafForMenu) || partialMap.has(selectedDafForMenu)
              : false
          }
          onSelectFull={() => {
            onToggleDafLearned(masechet.en, selectedDafForMenu);
            setSelectedDafForMenu(null);
          }}
          onSelectHalfA={() => {
            markPersonalPartialAmud(masechet.en, selectedDafForMenu, 'a');
            setSelectedDafForMenu(null);
          }}
          onSelectHalfB={() => {
            markPersonalPartialAmud(masechet.en, selectedDafForMenu, 'b');
            setSelectedDafForMenu(null);
          }}
          onUnmark={() => {
            setPersonalDafStudyStatus(masechet.en, selectedDafForMenu, 'none');
            setSelectedDafForMenu(null);
          }}
          onOpenTzuratHadaf={
            onOpenTzuratHadaf
              ? () => {
                  const d = selectedDafForMenu;
                  setSelectedDafForMenu(null);
                  onOpenTzuratHadaf(masechet.en, d);
                }
              : undefined
          }
          onCancel={() => setSelectedDafForMenu(null)}
        />
      )}
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
    dafCellPartial: {
      backgroundColor: theme.colors.accent + '25',
      borderColor: theme.colors.accent + '70',
      borderStyle: 'dashed',
    },
    dafCornerBadge: {
      position: 'absolute',
      top: 2,
      left: 3,
      paddingHorizontal: 3,
      paddingVertical: 1,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    dafCornerBadgeText: {
      fontSize: 8,
      fontWeight: '900',
      color: '#FFFFFF',
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
    dafTextPartial: {
      color: theme.colors.accent,
    },
  });
