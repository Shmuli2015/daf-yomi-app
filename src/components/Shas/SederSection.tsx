import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useGuideSectionAnimation } from '../Guide/useGuideSectionAnimation';
import AccordionSlideContent from '../AccordionSlideContent';
import { formatProgressCount } from '../../utils/dafStatus';
import type { Seder } from '../../data/shas';
import { createSederSectionStyles } from './SederSection.styles';

interface SederSectionProps {
  sederId: Seder;
  sederName: string;
  percentage: number;
  learnedDafim: number;
  totalDafim: number;
  completedMasechtot: number;
  totalMasechtot: number;
  isExpanded: boolean;
  onToggle: (sederId: Seder) => void;
  children?: React.ReactNode;
}

const SederSection = React.memo(function SederSection({
  sederId,
  sederName,
  percentage,
  learnedDafim,
  totalDafim,
  completedMasechtot,
  totalMasechtot,
  isExpanded,
  onToggle,
  children,
}: SederSectionProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSederSectionStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const handlePress = useCallback(() => {
    onToggle(sederId);
  }, [onToggle, sederId]);

  const isComplete = percentage === 100;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerContainer}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${sederName}, ${percentage}% הושלמו`}
      >
        <View style={styles.headerRow}>
          <View style={styles.rightGroup}>
            <View style={styles.accentBar} />
            <View style={styles.titleInfo}>
              <Text style={styles.sederName}>{sederName}</Text>
              <Text style={styles.statLine}>
                {`\u200F${completedMasechtot} מתוך ${totalMasechtot} מסכתות`}
              </Text>
              <Text style={styles.statLine}>
                {`\u200F${formatProgressCount(learnedDafim)} מתוך ${totalDafim} דפים`}
              </Text>
            </View>
          </View>

          <View style={styles.leftGroup}>
            <View
              style={[
                styles.percentageBadge,
                isComplete && styles.percentageBadgeComplete,
              ]}
            >
              <Text
                style={[
                  styles.percentageText,
                  isComplete && styles.percentageTextComplete,
                ]}
              >
                {percentage}%
              </Text>
            </View>

            <View style={styles.chevronBox}>
              <Animated.View style={animatedChevronStyle}>
                <Ionicons
                  name="chevron-down-outline"
                  size={15}
                  color={theme.colors.textMuted}
                />
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </TouchableOpacity>

      <AccordionSlideContent
        isExpanded={Boolean(isExpanded && children)}
        adaptCloseToHeight
        slideContent
      >
        <View style={styles.contentContainer}>
          <View style={styles.contentDivider} />
          {children}
        </View>
      </AccordionSlideContent>
    </View>
  );
});

export default SederSection;
