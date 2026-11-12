import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { SefariaCommentaryItem, SefariaSegment } from '../../services/sefariaTextApi';
import { useTheme } from '../../theme';
import { triggerImpact } from '../../utils/haptics';
import { formatCommentaryBadgeLabel } from '../../utils/commentaryFilters';
import { isMishnahHeading } from '../../utils/commentaryEmphasis';
import type { MishnahJoinRole } from '../../utils/mishnahJoin';
import { useGuideSectionAnimation } from '../Guide/useGuideSectionAnimation';
import AccordionSlideContent from '../AccordionSlideContent';
import type { AccordionCollapseScroll } from '../../hooks/useAccordionSlide';
import CommentaryBodyText from './CommentaryBodyText';
import InlineCommentarySection from './InlineCommentarySection';
import { createMishnahJoinStyles } from './mishnahJoin.styles';
import { createSegmentCardStyles } from './SegmentCard.styles';
import { SEFARIA_TEXT_SCROLL_GAP } from './SefariaTextContainer.styles';

interface SegmentCardProps {
  segment: SefariaSegment;
  commentaries: SefariaCommentaryItem[];
  fontSize: number;
  accentColor: string;
  accentLight?: string;
  accentBorder?: string;
  commentarySurfaceColor?: string;
  isExpanded: boolean;
  isClosing?: boolean;
  onToggleExpand: (index: number) => void;
  onCardLayout?: (index: number, y: number, height: number) => void;
  onCommentaryLayout?: (index: number, height: number) => void;
  collapseScroll?: AccordionCollapseScroll;
  isSepia?: boolean;
  isDark?: boolean;
  markAsMishnah?: boolean;
  mishnahJoinRole?: MishnahJoinRole | null;
  mishnahSurfaceColor?: string;
  searchQuery?: string;
  isActiveSearchMatch?: boolean;
  activeSearchOccurrenceIndex?: number | null;
}

const SegmentCard = React.memo(function SegmentCard({
  segment,
  commentaries,
  fontSize,
  accentColor,
  accentLight,
  accentBorder,
  commentarySurfaceColor,
  isExpanded,
  isClosing,
  onToggleExpand,
  onCardLayout,
  onCommentaryLayout,
  collapseScroll,
  isSepia,
  isDark,
  markAsMishnah = false,
  mishnahJoinRole = null,
  mishnahSurfaceColor,
  searchQuery = '',
  isActiveSearchMatch = false,
  activeSearchOccurrenceIndex = null,
}: SegmentCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSegmentCardStyles(theme), [theme]);
  const mishnahJoinStyles = useMemo(
    () => createMishnahJoinStyles(theme, SEFARIA_TEXT_SCROLL_GAP),
    [theme],
  );
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const hasCommentary = commentaries.length > 0;
  const isMishnahStart = Boolean(segment.mishnahLabel) || isMishnahHeading(segment.he);
  const showMishnahMark = markAsMishnah || isMishnahStart;
  const joinRole = mishnahJoinRole ?? (showMishnahMark ? 'solo' : null);
  const textColor = isSepia
    ? '#2C221E'
    : isDark
    ? '#FFFFFF'
    : '#0F172A';

  const badgeBg = accentLight ?? `${accentColor}14`;
  const badgeTextColor = accentColor;
  const activeSearchBg = accentLight ?? theme.colors.accentLight;

  const handleToggle = () => {
    if (!hasCommentary) return;
    triggerImpact('light');
    onToggleExpand(segment.index);
  };

  const handleCardLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    onCardLayout?.(segment.index, y, height);
  };

  const handleCommentaryLayout = (event: LayoutChangeEvent) => {
    onCommentaryLayout?.(segment.index, event.nativeEvent.layout.height);
  };

  const textStyle = [
    styles.text,
    {
      color: textColor,
      fontSize,
      lineHeight: Math.round(fontSize * 1.6),
    },
  ];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        joinRole && [
          mishnahJoinStyles[joinRole],
          { backgroundColor: mishnahSurfaceColor },
        ],
        isActiveSearchMatch && { backgroundColor: activeSearchBg },
      ]}
      onPress={handleToggle}
      onLayout={handleCardLayout}
      activeOpacity={hasCommentary ? 0.75 : 1}
    >
      <View style={styles.cardMain}>
        {segment.mishnahLabel ? (
          <Text style={[styles.mishnahLabel, { color: accentColor }]}>
            {`\u200F${segment.mishnahLabel}`}
          </Text>
        ) : isMishnahStart ? (
          <Text style={[styles.mishnahLabel, { color: accentColor }]}>
            {'\u200Fמשנה'}
          </Text>
        ) : null}

        <CommentaryBodyText
          text={segment.he}
          baseStyle={textStyle}
          accentColor={accentColor}
          searchQuery={searchQuery}
          activeOccurrenceIndex={
            isActiveSearchMatch ? activeSearchOccurrenceIndex : null
          }
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
              commentarySurfaceColor={
                commentarySurfaceColor ?? theme.colors.accentLight
              }
              commentaryBorderColor={accentBorder ?? theme.colors.accentBorder}
              isSepia={isSepia}
              isDark={isDark}
            />
          </View>
        </AccordionSlideContent>
      )}
    </TouchableOpacity>
  );
});

export default SegmentCard;
