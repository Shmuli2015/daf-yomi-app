import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { type SharedValue } from 'react-native-reanimated';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import CommentaryBodyText from './CommentaryBodyText';
import ReaderSkeleton from './ReaderSkeleton';
import ScrollToTopFab from './ScrollToTopFab';
import type { SefariaPageData } from '../../services/sefariaTextApi';
import { insertChapterBoundaries } from '../../utils/chapterBoundaries';
import { collectCommentariesWithIndex } from '../../utils/sefariaCommentators';
import { useTheme } from '../../theme';
import { mishnahSpanFlags } from '../../utils/commentaryEmphasis';
import { mishnahJoinRoles } from '../../utils/mishnahJoin';
import type { ReaderTheme } from './ReaderToolbar';
import { getReaderThemePalette } from '../../utils/readerTheme';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { scrollReaderTo } from '../../utils/readerScroll';
import { useReaderPosition } from '../../hooks/useReaderPosition';
import type { AutoScrollSpeedLevel } from '../../hooks/useAutoScroll';
import { createMishnahJoinStyles } from './mishnahJoin.styles';
import {
  createSteinsaltzTextContainerStyles,
  STEINSALTZ_TEXT_SCROLL_GAP,
} from './SteinsaltzTextContainer.styles';

interface SteinsaltzTextContainerProps {
  data: SefariaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReportError?: () => void;
  fontSize: number;
  readerTheme?: ReaderTheme;
  accentColor: string;
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

export default function SteinsaltzTextContainer({
  data,
  loading,
  error,
  onRetry,
  onReportError,
  fontSize,
  readerTheme,
  accentColor,
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
}: SteinsaltzTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSteinsaltzTextContainerStyles(theme), [theme]);
  const mishnahJoinStyles = useMemo(
    () => createMishnahJoinStyles(theme, STEINSALTZ_TEXT_SCROLL_GAP),
    [theme],
  );

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

  const palette = useMemo(
    () => getReaderThemePalette(readerTheme ?? 'light', accentColor),
    [readerTheme, accentColor],
  );
  const paragraphs = useMemo(
    () => (data ? collectCommentariesWithIndex(data.commentaries, 'steinsaltz') : []),
    [data],
  );
  const blocks = useMemo(
    () => insertChapterBoundaries(paragraphs, data?.chapterEvents ?? []),
    [paragraphs, data?.chapterEvents],
  );
  const mishnahMarks = useMemo(
    () => mishnahSpanFlags(blocks.map((block) => (block.kind === 'paragraph' ? block.item.he : null))),
    [blocks],
  );
  const mishnahJoins = useMemo(() => mishnahJoinRoles(mishnahMarks), [mishnahMarks]);
  const blockIndexBySegmentId = useMemo(() => {
    const map = new Map<string, number>();
    blocks.forEach((block, index) => {
      if (block.kind === 'paragraph') {
        map.set(block.item.ref, index);
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

  const listHeader = useMemo(
    () => (
      <View style={[styles.headerBox, { borderBottomColor: palette.borderColor }]}>
        <Text style={[styles.titleHe, { color: palette.accentColor }]}>
          {`שטיינזלץ · ${data?.titleHe ?? ''}`}
        </Text>
      </View>
    ),
    [data?.titleHe, palette.accentColor, palette.borderColor, styles.headerBox, styles.titleHe],
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
      const joinRole = mishnahJoins[index];
      const isActiveSearchMatch = activeSearchSegmentId === block.item.ref;
      const textStyle = [
        styles.paragraphText,
        {
          color: palette.textColor,
          fontSize,
          lineHeight: Math.round(fontSize * 1.7),
        },
      ];
      return (
        <View
          style={[
            styles.paragraph,
            joinRole && [
              mishnahJoinStyles[joinRole],
              { backgroundColor: palette.mishnahSurfaceColor },
            ],
            isActiveSearchMatch && { backgroundColor: palette.accentLight },
          ]}
        >
          <CommentaryBodyText
            text={block.item.he}
            commentator="steinsaltz"
            baseStyle={textStyle}
            accentColor={palette.accentColor}
            searchQuery={searchQuery}
            activeOccurrenceIndex={isActiveSearchMatch ? activeSearchOccurrenceIndex : null}
          />
        </View>
      );
    },
    [
      activeSearchOccurrenceIndex,
      activeSearchSegmentId,
      fontSize,
      mishnahJoinStyles,
      mishnahJoins,
      palette,
      searchQuery,
      styles.paragraph,
      styles.paragraphText,
    ],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}>
        <ReaderSkeleton />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: palette.backgroundColor }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={palette.subTextColor} />
        <Text style={[styles.errorTitle, { color: palette.textColor }]}>לא ניתן לטעון את שטיינזלץ</Text>
        <Text style={[styles.errorSub, { color: palette.subTextColor }]}>{error || 'שגיאה בטעינת ביאור שטיינזלץ'}</Text>
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

  if (paragraphs.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: palette.backgroundColor }]}>
        <Ionicons name="reader-outline" size={48} color={palette.subTextColor} />
        <Text style={[styles.errorTitle, { color: palette.textColor }]}>לא נמצא ביאור שטיינזלץ לדף זה</Text>
        <Text style={[styles.errorSub, { color: palette.subTextColor }]}>ניתן לקרוא את הגמרא בטאב גמרא או בחברותא.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}>
      <Animated.FlatList
        ref={scrollViewRef as never}
        data={blocks}
        keyExtractor={(block, index) =>
          block.kind === 'paragraph' ? block.item.ref : `${block.kind}-${index}`
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
