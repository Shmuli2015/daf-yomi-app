import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';
import { PersonalTrackRecord } from '../db/database';
import { formatProgressCount } from '../utils/dafStatus';

interface PersonalTrackBannerProps {
  activeMasechetEn: string | null;
  personalTrackRecords: PersonalTrackRecord[];
  onSelectMasechetPress: () => void;
  onOpenMasechetDetailPress?: () => void;
  onToggleDafLearned: (masechetEn: string, dafNum: number) => void;
  onOpenTzuratHadaf?: (masechetEn: string, dafNum: number) => void;
}

export default function PersonalTrackBanner({
  activeMasechetEn,
  personalTrackRecords,
  onSelectMasechetPress,
  onOpenMasechetDetailPress,
  onToggleDafLearned,
  onOpenTzuratHadaf,
}: PersonalTrackBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const masechet = useMemo(() => {
    if (!activeMasechetEn) return null;
    return SHAS_MASECHTOT.find((m) => m.en === activeMasechetEn) || null;
  }, [activeMasechetEn]);

  const { learnedCount, totalPages, percentage, nextDafNum } = useMemo(() => {
    if (!masechet) {
      return { learnedCount: 0, totalPages: 0, percentage: 0, nextDafNum: null };
    }

    const masechetRecords = personalTrackRecords.filter(
      (r) => r.masechet === masechet.en && r.status === 'learned'
    );
    const learnedSet = new Set(masechetRecords.map((r) => r.daf_num));
    const count = learnedSet.size;
    const total = masechet.pages;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    let next: number | null = null;
    for (let d = 2; d < 2 + total; d++) {
      if (!learnedSet.has(d)) {
        next = d;
        break;
      }
    }

    return {
      learnedCount: count,
      totalPages: total,
      percentage: pct,
      nextDafNum: next,
    };
  }, [masechet, personalTrackRecords]);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(percentage, { duration: 800 });
  }, [percentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (!masechet) {
    return (
      <View style={styles.outerContainer}>
        <TouchableOpacity
          style={styles.emptyContainer}
          activeOpacity={0.85}
          onPress={onSelectMasechetPress}
        >
          <LinearGradient
            colors={[theme.colors.accent + '0C', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.emptyHeaderRow}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bookmark-outline" size={22} color={theme.colors.accent} />
            </View>
            <View style={styles.emptyTitleSection}>
              <Text style={styles.emptyTitle}>המסלול האישי שלי</Text>
              <Text style={styles.emptySubtitle}>מעקב עצמאי אחר מסכת לבחירתך בקצב שלך</Text>
            </View>
          </View>

          <View style={styles.addBtn}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>בחר מסכת ללימוד</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const nextDafGematria = nextDafNum ? numberToGematria(nextDafNum) : null;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.accent + '10', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerTitleRow}
            onPress={onOpenMasechetDetailPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="bookmark" size={18} color={theme.colors.accent} />
            </View>
            <View>
              <Text style={styles.bannerTag}>מסלול אישי</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.masechetTitle}>מסכת {masechet.he}</Text>
                <Ionicons name="chevron-back" size={16} color={theme.colors.accent} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.actionButtonsGroup}>
            <TouchableOpacity
              style={styles.gridBtn}
              onPress={onOpenMasechetDetailPress}
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={14} color={theme.colors.accent} />
              <Text style={styles.gridBtnText}>כל הדפים</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeMasechetBtn}
              onPress={onSelectMasechetPress}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar Section */}
        <View style={styles.progressSection}>
          <View style={styles.statsRow}>
            <View style={styles.mainStat}>
              <Text style={styles.percentageText}>{percentage}</Text>
              <Text style={styles.percentageSymbol}>%</Text>
            </View>
            <Text style={styles.countText}>
              {formatProgressCount(learnedCount)} מתוך {totalPages} דפים
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, animatedProgressStyle]}>
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accent + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Next Daf & Quick Action */}
        <View style={styles.footerRow}>
          {nextDafNum ? (
            <View style={styles.nextDafInfo}>
              <Text style={styles.nextDafLabel}>הדף הבא בתור:</Text>
              <TouchableOpacity
                onPress={() => onOpenTzuratHadaf?.(masechet.en, nextDafNum)}
                activeOpacity={0.7}
              >
                <Text style={styles.nextDafValue}>דף {nextDafGematria}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.completedInfo}>
              <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
              <Text style={styles.completedText}>כל הכבוד! השלמת את המסכת 🎉</Text>
            </View>
          )}

          {nextDafNum && (
            <TouchableOpacity
              style={styles.quickMarkBtn}
              onPress={() => onToggleDafLearned(masechet.en, nextDafNum)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFF" />
              <Text style={styles.quickMarkText}>סמן כנלמד</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outerContainer: {
      marginHorizontal: 20,
    },
    emptyContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.accentBorder || theme.colors.border,
      borderStyle: 'dashed',
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    emptyHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16,
    },
    emptyIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitleSection: {
      flex: 1,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    addBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addBtnText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '800',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.cardMedium,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerTag: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.accent,
      textTransform: 'uppercase',
    },
    masechetTitle: {
      fontSize: 17,
      fontWeight: '900',
      color: theme.colors.textPrimary,
    },
    actionButtonsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gridBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.accentLight + '40',
      borderRadius: 10,
    },
    gridBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    changeMasechetBtn: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    changeMasechetText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    progressSection: {
      gap: 8,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    mainStat: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    percentageText: {
      color: theme.colors.accent,
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 30,
    },
    percentageSymbol: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 2,
    },
    countText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: theme.colors.progressTrack,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '60',
    },
    nextDafInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    nextDafLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    nextDafValue: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textDecorationLine: 'underline',
    },
    completedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    completedText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    quickMarkBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    quickMarkText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });
