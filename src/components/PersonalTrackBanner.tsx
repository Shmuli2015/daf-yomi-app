import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { numberToGematria } from '../data/shas';
import { formatProgressCount } from '../utils/dafStatus';
import { usePersonalTrackStats } from '../hooks/usePersonalTrackStats';
import { createPersonalTrackBannerStyles } from './PersonalTrack/PersonalTrackBanner.styles';
import type { PersonalTrackRecord } from '../db/database';

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
  const styles = useMemo(() => createPersonalTrackBannerStyles(theme), [theme]);

  const {
    masechet,
    learnedCount,
    totalPages,
    percentage,
    nextDafNum,
    animatedProgressStyle,
  } = usePersonalTrackStats(activeMasechetEn, personalTrackRecords);

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
