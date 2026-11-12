import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  type ListRenderItem,
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
import { scrollReaderTo } from '../../utils/readerScroll';
import { useReaderPosition } from '../../hooks/useReaderPosition';
import { useCommentaryCollapseScroll } from '../../hooks/useCommentaryCollapseScroll';
import type { AutoScrollSpeedLevel } from '../../hooks/useAutoScroll';
import { createSefariaTextContainerStyles } from './SefariaTextContainer.styles';

const EMPTY_COMMENTARIES: never[] = [];

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
  const headerHeightRef = useRef(0);
  const itemHeightsRef = useRef(new Map<number, number>());

  const { scrollViewRef, scrollYRef, showFab, handleScroll, handleScrollBeginDrag, handleContentSizeChange, scrollToTop, scrollToIndex } =
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
    setExpandedIndices(new Set());
    itemHeightsRef.current.clear();
  }, [data?.tref]);

  const { clearSavedPosition, reportVisibleIndex } = useReaderPosition({
    positionKey,
    scrollViewRef,
    scrollYRef,
    skipRestore: initialScrollOffset > 1,
    scrollToIndex,
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
    registerCardLayout(index, y, height);
  }, [registerCardLayout]);

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

  const blockIndexBySegmentId = useMemo(() => {
    const map = new Map<string, number>();
    blocks.forEach((block, index) => {
      if (block.kind === 'paragraph') {
        map.set(String(block.item.index), index);
      }
    });
    return map;
  }, [blocks]);

  useEffect(() => {
    if (!activeSearchSegmentId) return;
    const index = blockIndexBySegmentId.get(activeSearchSegmentId);
    if (index == null) return;
    scrollToIndex(index);
  }, [activeSearchOccurrenceIndex, activeSearchSegmentId, blockIndexBySegmentId, scrollToIndex]);

  const reportVisibleIndexRef = useRef(reportVisibleIndex);
  reportVisibleIndexRef.current = reportVisibleIndex;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 35 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number | null; isViewable: boolean }> }) => {
      const top = viewableItems.find((item) => item.isViewable && typeof item.index === 'number');
      if (top && typeof top.index === 'number') {
        reportVisibleIndexRef.current(top.index);
      }
    },
  ).current;

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      scrollReaderTo(scrollViewRef.current, info.averageItemLength * info.index, false);
      setTimeout(() => scrollToIndex(info.index, 24, false), 60);
    },
    [scrollToIndex, scrollViewRef],
  );

  const contentYForBlock = useCallback((blockIndex: number) => {
    let y = headerHeightRef.current;
    for (let i = 0; i < blockIndex; i += 1) {
      const height = itemHeightsRef.current.get(i);
      if (height == null) {
        return null;
      }
      y += height;
    }
    return y;
  }, []);

  const listHeader = useMemo(
    () => (
      <View
        onLayout={(event) => {
          headerHeightRef.current = event.nativeEvent.layout.height;
        }}
      >
        <View style={[styles.headerBox, { borderBottomColor: palette.borderColor }]}>
          <Text style={[styles.titleHe, { color: palette.accentColor }]}>{data?.titleHe ?? ''}</Text>
        </View>
        {showCommentaryBanner ? (
          <CommentaryLoadBanner
            onRetry={onRetry}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}
      </View>
    ),
    [
      data?.titleHe,
      onRetry,
      palette.accentColor,
      palette.borderColor,
      showCommentaryBanner,
      styles.headerBox,
      styles.titleHe,
    ],
  );

  const renderItem = useCallback<ListRenderItem<(typeof blocks)[number]>>(
    ({ item: block, index }) => {
      if (block.kind === 'chapterStart') {
        return (
          <ChapterBoundaryMarker
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
            kind="end"
            titleHe={block.titleHe}
            isMasechetEnd={block.isMasechetEnd}
            masechetHe={block.masechetHe}
            palette={palette}
          />
        );
      }

      const segment = block.item;
      const commList = classicCommentaries[segment.index] ?? EMPTY_COMMENTARIES;
      const isExpanded = expandedIndices.has(segment.index);
      return (
        <View
          onLayout={(event) => {
            const height = event.nativeEvent.layout.height;
            itemHeightsRef.current.set(index, height);
            const y = contentYForBlock(index);
            if (y == null) {
              return;
            }
            handleCardLayout(segment.index, y, height);
          }}
        >
          <SegmentCard
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
        </View>
      );
    },
    [
      activeSearchOccurrenceIndex,
      activeSearchSegmentId,
      classicCommentaries,
      closingIndex,
      collapseScroll,
      contentYForBlock,
      expandedIndices,
      fontSize,
      handleCardLayout,
      handleCommentaryLayout,
      handleToggleExpand,
      mishnahJoins,
      mishnahMarks,
      palette,
      searchQuery,
    ],
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
      <Animated.FlatList
        ref={scrollViewRef as never}
        data={blocks}
        keyExtractor={(block, index) =>
          block.kind === 'paragraph' ? `segment-${block.item.index}` : `${block.kind}-${index}`
        }
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        windowSize={7}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged as never}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />

      <ScrollToTopFab
        visible={showFab}
        onPress={handleScrollToTop}
        accentColor={palette.accentColor}
      />
    </View>
  );
}
