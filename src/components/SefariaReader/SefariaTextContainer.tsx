import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { type SharedValue } from 'react-native-reanimated';
import type { SefariaPageData } from '../../services/sefariaTextApi';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import SegmentCard from './SegmentCard';
import ReaderSkeleton from './ReaderSkeleton';
import ScrollToTopFab from './ScrollToTopFab';
import CommentaryLoadBanner from './CommentaryLoadBanner';
import type { ReaderTheme } from './ReaderToolbar';
import { getReaderThemePalette } from '../../utils/readerTheme';
import { useTheme } from '../../theme';
import { mishnahSpanFlags } from '../../utils/commentaryEmphasis';
import { mishnahJoinRoles } from '../../utils/mishnahJoin';
import { insertChapterBoundaries } from '../../utils/chapterBoundaries';
import { classicCommentatorKeysForTref, filterCommentaries } from '../../utils/sefariaCommentators';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useReaderPosition } from '../../hooks/useReaderPosition';
import { useCommentaryCollapseScroll } from '../../hooks/useCommentaryCollapseScroll';
import type { AutoScrollSpeedLevel } from '../../hooks/useAutoScroll';
import { createSefariaTextContainerStyles } from './SefariaTextContainer.styles';

interface SefariaTextContainerProps {
  data: SefariaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReportError?: () => void;
  fontSize: number;
  readerTheme?: ReaderTheme;
  accentColor: string;
  classicTabLabel?: string;
  scrollProgress?: SharedValue<number>;
  initialScrollOffset?: number;
  onScrollOffset?: (offset: number) => void;
  positionKey?: string;
  autoScrollActive?: boolean;
  autoScrollLevel?: AutoScrollSpeedLevel;
  autoScrollPaused?: boolean;
  onAutoScrollPause?: () => void;
  searchQuery?: string;
  activeSearchSegmentId?: string | null;
  activeSearchOccurrenceIndex?: number | null;
}

export default function SefariaTextContainer({
  data,
  loading,
  error,
  onRetry,
  onReportError,
  fontSize,
  readerTheme,
  accentColor,
  classicTabLabel = 'גמרא',
  scrollProgress,
  initialScrollOffset = 0,
  onScrollOffset,
  positionKey,
  autoScrollActive,
  autoScrollLevel,
  autoScrollPaused,
  onAutoScrollPause,
  searchQuery = '',
  activeSearchSegmentId = null,
  activeSearchOccurrenceIndex = null,
}: SefariaTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSefariaTextContainerStyles(theme), [theme]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const expandedIndicesRef = useRef(expandedIndices);
  expandedIndicesRef.current = expandedIndices;
  const segmentOffsetsRef = useRef<Map<number, number>>(new Map());

  const { scrollViewRef, scrollYRef, showFab, handleScroll, handleScrollBeginDrag, handleContentSizeChange, scrollToTop, scrollToY } =
    useScrollProgress({
      progressShared: scrollProgress,
      resetKey: data?.tref || '',
      initialOffset: initialScrollOffset,
      onOffsetChange: onScrollOffset,
      autoScrollActive,
      autoScrollLevel,
      autoScrollPaused,
      onAutoScrollPause,
    });

  useEffect(() => {
    setBannerDismissed(false);
  }, [data?.tref]);

  useEffect(() => {
    if (!activeSearchSegmentId) return;
    const segmentIndex = Number(activeSearchSegmentId);
    if (Number.isNaN(segmentIndex)) return;
    const y = segmentOffsetsRef.current.get(segmentIndex);
    if (y == null) return;
    scrollToY(Math.max(0, y - 24));
  }, [activeSearchSegmentId, scrollToY]);

  const { registerAnchor, clearSavedPosition } = useReaderPosition({
    positionKey,
    scrollViewRef,
    scrollYRef,
    skipRestore: initialScrollOffset > 1,
  });

  const handleScrollToTop = useCallback(() => {
    clearSavedPosition();
    scrollToTop();
  }, [clearSavedPosition, scrollToTop]);

  const { registerCardLayout, registerCommentaryHeight, beginCollapse, collapseScroll, closingIndex } =
    useCommentaryCollapseScroll({
      scrollViewRef,
      scrollYRef,
      resetKey: data?.tref || '',
    });

  const classicCommentaries = useMemo(
    () =>
      data
        ? filterCommentaries(data.commentaries, classicCommentatorKeysForTref(data.tref))
        : {},
    [data],
  );

  const blocks = useMemo(
    () =>
      insertChapterBoundaries(
        (data?.segments ?? []).map((segment) => ({ index: segment.index, item: segment })),
        data?.chapterEvents ?? [],
      ),
    [data?.segments, data?.chapterEvents],
  );

  const mishnahMarks = useMemo(
    () => mishnahSpanFlags(blocks.map((block) => (block.kind === 'paragraph' ? block.item.he : null))),
    [blocks],
  );
  const mishnahJoins = useMemo(() => mishnahJoinRoles(mishnahMarks), [mishnahMarks]);

  const nextSegmentIndexByIndex = useMemo(() => {
    const map = new Map<number, number>();
    const segmentIndices: number[] = [];
    for (const block of blocks) {
      if (block.kind === 'paragraph') {
        segmentIndices.push(block.item.index);
      }
    }
    for (let i = 0; i < segmentIndices.length - 1; i += 1) {
      map.set(segmentIndices[i], segmentIndices[i + 1]);
    }
    return map;
  }, [blocks]);

  const nextSegmentIndexByIndexRef = useRef(nextSegmentIndexByIndex);
  nextSegmentIndexByIndexRef.current = nextSegmentIndexByIndex;

  const handleToggleExpand = useCallback((index: number) => {
    if (expandedIndicesRef.current.has(index)) {
      beginCollapse(index, nextSegmentIndexByIndexRef.current.get(index) ?? null);
    }
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, [beginCollapse]);

  const handleCardLayout = useCallback((index: number, y: number, height: number) => {
    segmentOffsetsRef.current.set(index, y);
    registerCardLayout(index, y, height);
    registerAnchor(index, y);
  }, [registerCardLayout, registerAnchor]);

  const classicFailedCommentators = useMemo(() => {
    if (!data?.failedCommentators?.length) return [];
    const classicKeys = new Set(classicCommentatorKeysForTref(data.tref));
    return data.failedCommentators.filter((key) => classicKeys.has(key));
  }, [data]);

  const showCommentaryBanner = classicFailedCommentators.length > 0 && !bannerDismissed;

  const handleCommentaryLayout = useCallback((index: number, height: number) => {
    registerCommentaryHeight(index, height);
  }, [registerCommentaryHeight]);

  const palette = useMemo(
    () => getReaderThemePalette(readerTheme ?? 'light', accentColor),
    [readerTheme, accentColor],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}>
        <ReaderSkeleton showCommentaryBadges />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: palette.backgroundColor }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={palette.subTextColor} />
        <Text style={[styles.errorTitle, { color: palette.textColor }]}>לא ניתן לטעון את הטקסט</Text>
        <Text style={[styles.errorSub, { color: palette.subTextColor }]}>
          {error || 'שגיאה בטעינת הטקסט'}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: palette.accentColor }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryBtnText}>נסה שוב</Text>
        </TouchableOpacity>
        {onReportError ? (
          <TouchableOpacity
            style={[styles.reportBtn, { borderColor: palette.accentColor }]}
            onPress={onReportError}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="דיווח על התקלה"
          >
            <Text style={[styles.reportBtnText, { color: palette.accentColor }]}>
              דיווח על התקלה
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (data.segments.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: palette.backgroundColor }]}>
        <Ionicons name="book-outline" size={48} color={palette.subTextColor} />
        <Text style={[styles.errorTitle, { color: palette.textColor }]}>לא נמצא טקסט גמרא לדף זה</Text>
        <Text style={[styles.errorSub, { color: palette.subTextColor }]}>
          ניתן לנסות טאב אחר, או דף אחר במסכת.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
      >
        <View style={[styles.headerBox, { borderBottomColor: palette.borderColor }]}>
          <Text style={[styles.titleHe, { color: palette.accentColor }]}>{data.titleHe}</Text>
        </View>

        {showCommentaryBanner ? (
          <CommentaryLoadBanner
            onRetry={onRetry}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}

        {blocks.map((block, index) => {
          if (block.kind === 'chapterStart') {
            return (
              <ChapterBoundaryMarker
                key={`chapter-start-${index}`}
                kind="start"
                titleHe={block.titleHe}
                chapterNumber={block.chapterNumber}
                palette={palette}
              />
            );
          }
          if (block.kind === 'chapterEnd') {
            return (
              <ChapterBoundaryMarker
                key={`chapter-end-${index}`}
                kind="end"
                titleHe={block.titleHe}
                isMasechetEnd={block.isMasechetEnd}
                masechetHe={block.masechetHe}
                palette={palette}
              />
            );
          }

          const segment = block.item;
          const commList = classicCommentaries[segment.index] || [];
          const isExpanded = expandedIndices.has(segment.index);

          return (
            <SegmentCard
              key={`${segment.index}-${index}`}
              segment={segment}
              commentaries={commList}
              fontSize={fontSize}
              accentColor={palette.accentColor}
              accentLight={palette.accentLight}
              accentBorder={palette.accentBorder}
              commentarySurfaceColor={palette.commentarySurfaceColor}
              isExpanded={isExpanded}
              isClosing={closingIndex === segment.index}
              onToggleExpand={handleToggleExpand}
              onCardLayout={handleCardLayout}
              onCommentaryLayout={handleCommentaryLayout}
              collapseScroll={collapseScroll}
              isSepia={palette.isSepia}
              isDark={palette.isDark}
              markAsMishnah={mishnahMarks[index]}
              mishnahJoinRole={mishnahJoins[index]}
              mishnahSurfaceColor={palette.mishnahSurfaceColor}
              searchQuery={searchQuery}
              isActiveSearchMatch={activeSearchSegmentId === String(segment.index)}
              activeSearchOccurrenceIndex={
                activeSearchSegmentId === String(segment.index)
                  ? activeSearchOccurrenceIndex
                  : null
              }
            />
          );
        })}
      </Animated.ScrollView>

      <ScrollToTopFab
        visible={showFab}
        onPress={handleScrollToTop}
        accentColor={palette.accentColor}
      />
    </View>
  );
}
