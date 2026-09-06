import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { SHAS_MASECHTOT, SEDARIM } from '../data/shas';
import { PersonalTrackRecord } from '../db/database';

interface PersonalMasechetPickerModalProps {
  visible: boolean;
  selectedMasechetEn: string | null;
  personalTrackRecords: PersonalTrackRecord[];
  onSelectMasechet: (masechetEn: string | null) => void;
  onOpenMasechetDetail?: (masechetEn: string) => void;
  onClose: () => void;
}

export default function PersonalMasechetPickerModal({
  visible,
  selectedMasechetEn,
  personalTrackRecords,
  onSelectMasechet,
  onOpenMasechetDetail,
  onClose,
}: PersonalMasechetPickerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const progressMap = useMemo(() => {
    const map = new Map<string, { learned: number; total: number; pct: number }>();
    for (const m of SHAS_MASECHTOT) {
      const recs = personalTrackRecords.filter(
        (r) => r.masechet === m.en && r.status === 'learned'
      );
      const learned = new Set(recs.map((r) => r.daf_num)).size;
      const total = m.pages;
      const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
      map.set(m.en, { learned, total, pct });
    }
    return map;
  }, [personalTrackRecords]);

  const activeProgressMasechtot = useMemo(() => {
    return SHAS_MASECHTOT.filter((m) => {
      const info = progressMap.get(m.en);
      return info && info.learned > 0;
    });
  }, [progressMap]);

  const handleSelect = (masechetEn: string | null) => {
    onSelectMasechet(masechetEn);
    onClose();
  };

  const handleOpenDetail = (masechetEn: string) => {
    onClose();
    onOpenMasechetDetail?.(masechetEn);
  };

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
            <Text style={styles.title}>בחירת מסכת ללימוד אישי</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            כל דף שתסמן מצטרף להספק הש״ס הכללי. בחר מסכת להצגה במסך הבית, או היכנס לכל מסכת כדי לסמן דפים.
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {selectedMasechetEn !== null && (
              <TouchableOpacity
                style={styles.cancelBannerCard}
                onPress={() => handleSelect(null)}
                activeOpacity={0.7}
              >
                <View style={styles.cancelIconCircle}>
                  <Ionicons name="close" size={20} color={theme.colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cancelTitle}>הסר מסכת ממסך הבית</Text>
                  <Text style={styles.cancelSubtitle}>מעבר לסקירה כללית במסך הבית (כל הדפים שסומנו נשמרים תמיד)</Text>
                </View>
              </TouchableOpacity>
            )}

            {activeProgressMasechtot.length > 0 && (
              <View style={styles.activeSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="time-outline" size={18} color={theme.colors.accent} />
                  <Text style={styles.sectionTitle}>מסכתות שלמדת במסלול אישי</Text>
                </View>
                {activeProgressMasechtot.map((m) => {
                  const info = progressMap.get(m.en)!;
                  const isSelected = selectedMasechetEn === m.en;
                  return (
                    <TouchableOpacity
                      key={`active_${m.en}`}
                      style={[
                        styles.activeMasechetCard,
                        isSelected && styles.activeMasechetCardSelected,
                      ]}
                      onPress={() => handleSelect(m.en)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.activeCardLeft}>
                        <Text style={styles.activeMasechetName}>מסכת {m.he}</Text>
                        <Text style={styles.activeProgressText}>
                          נלמדו {info.learned} מתוך {info.total} דפים ({info.pct}%)
                        </Text>
                      </View>

                      <View style={styles.activeCardRight}>
                        {info.pct === 100 ? (
                          <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>הושלמה 🎉</Text>
                          </View>
                        ) : isSelected ? (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>מוצגת כעת</Text>
                          </View>
                        ) : (
                          <View style={styles.selectBtn}>
                            <Text style={styles.selectBtnText}>הצג בבית</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {SEDARIM.map((seder) => {
              const sederMasechtot = SHAS_MASECHTOT.filter((m) => m.seder === seder.id);
              return (
                <View key={seder.id} style={styles.sederSection}>
                  <View style={styles.sederHeader}>
                    <Text style={styles.sederTitle}>סדר {seder.he}</Text>
                  </View>
                  <View style={styles.grid}>
                    {sederMasechtot.map((m) => {
                      const isSelected = selectedMasechetEn === m.en;
                      const info = progressMap.get(m.en);
                      const hasProgress = info && info.learned > 0;

                      return (
                        <TouchableOpacity
                          key={m.en}
                          style={[
                            styles.masechetCard,
                            isSelected && styles.masechetCardSelected,
                            hasProgress && !isSelected && styles.masechetCardHasProgress,
                          ]}
                          onPress={() => handleSelect(m.en)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.masechetCardTop}>
                            <Text
                              style={[
                                styles.masechetName,
                                isSelected && styles.masechetNameSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {m.he}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={18} color={theme.colors.accent} />
                            )}
                          </View>

                          {hasProgress ? (
                            <Text style={styles.hasProgressText}>
                              {`\u2066${info.learned} / ${info.total}\u2069`} דפים ({info.pct}%)
                            </Text>
                          ) : (
                            <Text style={styles.pageCount}>{m.pages} דפים</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
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
      minHeight: '60%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      paddingHorizontal: 20,
      marginBottom: 16,
      lineHeight: 18,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    cancelBannerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1.5,
      borderColor: theme.colors.danger + '60',
    },
    cancelIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.danger + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.danger,
    },
    cancelSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    activeSection: {
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    activeMasechetCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeMasechetCardSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight + '30',
    },
    activeCardLeft: {
      flex: 1,
    },
    activeMasechetName: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    activeProgressText: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: '600',
      marginTop: 2,
    },
    activeCardRight: {
      marginLeft: 10,
    },
    selectedBadge: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 10,
    },
    selectedBadgeText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '700',
    },
    completedBadge: {
      backgroundColor: theme.colors.successLight || '#E8F5E9',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 10,
    },
    completedBadgeText: {
      color: theme.colors.success || '#2E7D32',
      fontSize: 12,
      fontWeight: '700',
    },
    selectBtn: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    sederSection: {
      marginBottom: 20,
    },
    sederHeader: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 6,
      marginBottom: 12,
    },
    sederTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    masechetCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: 'relative',
    },
    masechetCardSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight + '30',
    },
    masechetCardHasProgress: {
      borderColor: theme.colors.accentBorder,
    },
    masechetCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    masechetName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      flex: 1,
      marginRight: 4,
    },
    masechetNameSelected: {
      color: theme.colors.accent,
    },
    pageCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    hasProgressText: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });
