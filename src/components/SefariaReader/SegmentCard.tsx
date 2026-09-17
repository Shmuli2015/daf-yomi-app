import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { SefariaCommentaryItem, SefariaSegment } from '../../services/sefariaTextApi';
import { useTheme } from '../../theme';
import { triggerImpact } from '../../utils/haptics';
import { formatCommentaryBadgeLabel } from '../../utils/commentaryFilters';
import { useGuideSectionAnimation } from '../Settings/useGuideSectionAnimation';
import AccordionSlideContent from '../AccordionSlideContent';
import type { AccordionCollapseScroll } from '../../hooks/useAccordionSlide';
import CommentaryBodyText from './CommentaryBodyText';
import InlineCommentarySection from './InlineCommentarySection';
import { createSegmentCardStyles } from './SegmentCard.styles';

interface SegmentCardProps {
  segment: SefariaSegment;
  commentaries: SefariaCommentaryItem[];
  fontSize: number;
  accentColor: string;
  isExpanded: boolean;
  isClosing?: boolean;
  onToggleExpand: () => void;
  onCardLayout?: (y: number, height: number) => void;
  onCommentaryLayout?: (height: number) => void;
  collapseScroll?: AccordionCollapseScroll;
  isSepia?: boolean;
  isDark?: boolean;
}

export default function SegmentCard({
  segment,
  commentaries,
  fontSize,
  accentColor,
  isExpanded,
  isClosing,
  onToggleExpand,
  onCardLayout,
  onCommentaryLayout,
  collapseScroll,
  isSepia,
  isDark,
}: SegmentCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSegmentCardStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const hasCommentary = commentaries.length > 0;

  const textColor = isSepia ? '#2C221E' : theme.colors.textPrimary;

  const badgeBg = isSepia
    ? 'rgba(180, 83, 9, 0.10)'
    : isDark
    ? 'rgba(245, 158, 11, 0.14)'
    : `${accentColor}14`;

  const badgeTextColor = isSepia
    ? '#92400E'
    : isDark
    ? '#FBBF24'
    : accentColor;

  const handleToggle = () => {
    if (!hasCommentary) return;
    triggerImpact('light');
    onToggleExpand();
  };

  const handleCardLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    onCardLayout?.(y, height);
  };

  const handleCommentaryLayout = (event: LayoutChangeEvent) => {
    onCommentaryLayout?.(event.nativeEvent.layout.height);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleToggle}
      onLayout={handleCardLayout}
      activeOpacity={hasCommentary ? 0.75 : 1}
    >
      <View style={styles.cardMain}>
        {segment.mishnahLabel ? (
          <Text style={[styles.mishnahLabel, { color: accentColor }]}>
            {`\u200F${segment.mishnahLabel}`}
          </Text>
        ) : null}

        <CommentaryBodyText
          text={segment.he}
          baseStyle={[
            styles.text,
            {
              color: textColor,
              fontSize,
              lineHeight: Math.round(fontSize * 1.6),
            },
          ]}
          accentColor={accentColor}
        />

        {hasCommentary && (
          <View style={styles.commentaryBadgeRow}>
            <View style={[styles.commBadge, { backgroundColor: badgeBg }]}>
              <Ionicons name="chatbubbles-outline" size={13} color={badgeTextColor} />
              <Text style={[styles.commBadgeText, { color: badgeTextColor }]}>
                {`\u200F${formatCommentaryBadgeLabel(commentaries)}`}
              </Text>
              <Animated.View style={[styles.chevronIcon, animatedChevronStyle]}>
                <Ionicons name="chevron-down" size={13} color={badgeTextColor} />
              </Animated.View>
            </View>
          </View>
        )}
      </View>

      {hasCommentary && (
        <AccordionSlideContent
          isExpanded={isExpanded}
          collapseScroll={collapseScroll}
          collapseCardIndex={segment.index}
          adaptCloseToHeight
        >
          <View onLayout={handleCommentaryLayout} collapsable={false}>
            <InlineCommentarySection
              commentaries={commentaries}
              fontSize={fontSize}
              accentColor={accentColor}
              isSepia={isSepia}
            />
          </View>
        </AccordionSlideContent>
      )}
    </TouchableOpacity>
  );
}
