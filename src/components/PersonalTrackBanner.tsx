import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { numberToGematria } from '../data/shas';
import { formatProgressCount } from '../utils/dafStatus';
import { usePersonalTrackStats } from '../hooks/usePersonalTrackStats';
import { useAppStore } from '../store/useAppStore';
import { createPersonalTrackBannerStyles } from './PersonalTrack/PersonalTrackBanner.styles';
import PersonalTrackOverviewCard from './PersonalTrack/PersonalTrackOverviewCard';
import AccordionSlideContent from './AccordionSlideContent';
import DafMarkMenuModal from './DafMarkMenuModal';
import { useGuideSectionAnimation } from './Guide/useGuideSectionAnimation';
import type { PersonalTrackRecord } from '../db/database';

interface PersonalTrackBannerProps {
  activeMasechetEn: string | null;
  personalTrackRecords: PersonalTrackRecord[];
  onSelectMasechetPress: () => void;
  onOpenMasechetDetailPress?: () => void;
  onToggleDafLearned: (masechetEn: string, dafNum: number) => void;
  onOpenTzuratHadaf?: (masechetEn: string, dafNum: number) => void;
  hideMarkButton?: boolean;
  onOpenGuide?: () => void;
}

export default function PersonalTrackBanner({
  activeMasechetEn,
  personalTrackRecords,
  onSelectMasechetPress,
  onOpenMasechetDetailPress,
  onToggleDafLearned,
  onOpenTzuratHadaf,
  hideMarkButton = false,
  onOpenGuide,
}: PersonalTrackBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createPersonalTrackBannerStyles(theme), [theme]);
  const markPersonalPartialAmud = useAppStore((s) => s.markPersonalPartialAmud);
  const setPersonalDafStudyStatus = useAppStore((s) => s.setPersonalDafStudyStatus);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { animatedChevronStyle } = useGuideSectionAnimation(expanded);

  const {
    masechet,
    learnedCount,
    totalPages,
    percentage,
    nextDafNum,
    isNextDafPartial,
    nextDafAmud,
    animatedProgressStyle,
  } = usePersonalTrackStats(activeMasechetEn, personalTrackRecords);

  const totalPersonalLearnedCount = useMemo(() => {
    return personalTrackRecords.reduce(
      (sum, r) => sum + (r.status === 'learned' ? 1 : r.status === 'partial' ? 0.5 : 0),
      0,
    );
  }, [personalTrackRecords]);

  if (!masechet) {
    return (
      <PersonalTrackOverviewCard
        totalLearned={totalPersonalLearnedCount}
        onOpenPicker={onSelectMasechetPress}
        onOpenGuide={onOpenGuide}
      />
    );
  }

  const nextDafGematria = nextDafNum ? numberToGematria(nextDafNum) : null;
  const compactMeta = nextDafGematria
    ? `הדף הבא ${nextDafGematria}`
    : 'המסכת הושלמה';

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.accent + '10', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.compactRow}>
          <TouchableOpacity
            style={styles.headerTitleRow}
            onPress={() => {
              if (expanded) {
                onOpenMasechetDetailPress?.();
                return;
              }
              setExpanded(true);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              expanded
                ? `פרטי מסכת ${masechet.he}`
                : `מסלול אישי, מסכת ${masechet.he}`
            }
          >
            <View style={styles.iconContainer}>
              <Ionicons name="bookmark" size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.compactCopy}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.bannerTag}>מסלול אישי</Text>
                {onOpenGuide && (
                  <TouchableOpacity
                    onPress={onOpenGuide}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="הסבר על המסלול האישי"
                  >
                    <Ionicons
                      name="help-circle-outline"
                      size={15}
                      color={theme.colors.accent}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.masechetTitle}>מסכת {masechet.he}</Text>
              <Text style={styles.compactMeta}>{compactMeta}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setExpanded((open) => !open)}
            style={styles.collapseBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'כווץ מסלול אישי' : 'הרחב מסלול אישי'}
          >
            <Animated.View style={animatedChevronStyle}>
              <Ionicons name="chevron-down" size={18} color={theme.colors.accent} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <AccordionSlideContent isExpanded={expanded}>
          <View style={styles.expandedBody}>
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

              {nextDafNum && !hideMarkButton && (
                <TouchableOpacity
                  style={styles.quickMarkBtn}
                  onPress={() => onToggleDafLearned(masechet.en, nextDafNum)}
                  onLongPress={() => setShowMarkModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isNextDafPartial ? 'checkmark-circle' : 'checkmark-done'}
                    size={16}
                    color={theme.colors.white}
                  />
                  <Text style={styles.quickMarkText}>
                    {isNextDafPartial ? 'סיימתי את הדף!' : 'סמן כנלמד'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </AccordionSlideContent>
      </View>

      {nextDafNum && !hideMarkButton && (
        <DafMarkMenuModal
          visible={showMarkModal}
          partialAmud={isNextDafPartial ? nextDafAmud : null}
          showUnmark={isNextDafPartial}
          onSelectFull={() => {
            onToggleDafLearned(masechet.en, nextDafNum);
            setShowMarkModal(false);
          }}
          onSelectHalfA={() => {
            markPersonalPartialAmud(masechet.en, nextDafNum, 'a');
            setShowMarkModal(false);
          }}
          onSelectHalfB={() => {
            markPersonalPartialAmud(masechet.en, nextDafNum, 'b');
            setShowMarkModal(false);
          }}
          onUnmark={() => {
            setPersonalDafStudyStatus(masechet.en, nextDafNum, 'none');
            setShowMarkModal(false);
          }}
          onOpenTzuratHadaf={
            onOpenTzuratHadaf
              ? () => {
                  setShowMarkModal(false);
                  onOpenTzuratHadaf(masechet.en, nextDafNum);
                }
              : undefined
          }
          onCancel={() => setShowMarkModal(false)}
        />
      )}
    </View>
  );
}
