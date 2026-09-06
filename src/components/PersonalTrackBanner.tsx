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
import PersonalTrackOverviewCard from './PersonalTrack/PersonalTrackOverviewCard';
import type { PersonalTrackRecord } from '../db/database';

interface PersonalTrackBannerProps {
  activeMasechetEn: string | null;
  personalTrackRecords: PersonalTrackRecord[];
  onSelectMasechetPress: () => void;
  onOpenMasechetDetailPress?: () => void;
  onToggleDafLearned: (masechetEn: string, dafNum: number) => void;
  onOpenTzuratHadaf?: (masechetEn: string, dafNum: number) => void;
  onClearActiveMasechet?: () => void;
}

export default function PersonalTrackBanner({
  activeMasechetEn,
  personalTrackRecords,
  onSelectMasechetPress,
  onOpenMasechetDetailPress,
  onToggleDafLearned,
  onOpenTzuratHadaf,
  onClearActiveMasechet,
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

  const totalPersonalLearnedCount = useMemo(() => {
    return personalTrackRecords.filter((r) => r.status === 'learned').length;
  }, [personalTrackRecords]);

  if (!masechet) {
    return (
      <PersonalTrackOverviewCard
        totalLearned={totalPersonalLearnedCount}
        onOpenPicker={onSelectMasechetPress}
      />
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
              <View style={styles.titleWithChevron}>
                <Text style={styles.masechetTitle}>מסכת {masechet.he}</Text>
                <Ionicons name="chevron-back" size={16} color={theme.colors.accent} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.actionButtonsGroup}>
            <TouchableOpacity
              style={styles.changeMasechetBtn}
              onPress={onSelectMasechetPress}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={14} color={theme.colors.accent} />
              <Text style={styles.changeMasechetText}>החלף</Text>
            </TouchableOpacity>

            {onClearActiveMasechet && (
              <TouchableOpacity
                style={styles.clearMasechetBtn}
                onPress={onClearActiveMasechet}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.statsRow}>
            <Text style={styles.countText}>
              {formatProgressCount(learnedCount)} מתוך {totalPages} דפים
            </Text>
            <Text style={styles.percentageText}>
              {`\u2066${percentage}%\u2069`}
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
              <Text style={styles.nextDafLabel}>הדף הבא:</Text>
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
