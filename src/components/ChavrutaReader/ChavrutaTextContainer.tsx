import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { type SharedValue } from 'react-native-reanimated';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import ReaderSkeleton from '../SefariaReader/ReaderSkeleton';
import ScrollToTopFab from '../SefariaReader/ScrollToTopFab';
import type { ReaderTheme } from '../SefariaReader/ReaderToolbar';
import { getReaderThemePalette } from '../../utils/readerTheme';
import { useTheme } from '../../theme';
import type { ChavrutaBlock, ChavrutaFootnote, ChavrutaPageData } from '../../services/chavrutaApi';
import { mishnahJoinRoles } from '../../utils/mishnahJoin';
import { chavrutaMishnahFlags } from '../../utils/parseChavrutaHtml';
import ChavrutaBodyText from './ChavrutaBodyText';
import ChavrutaFootnoteSheet from './ChavrutaFootnoteSheet';
import ChavrutaSectionHeader from './ChavrutaSectionHeader';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { scrollReaderTo } from '../../utils/readerScroll';
import { useReaderPosition } from '../../hooks/useReaderPosition';
import type { AutoScrollSpeedLevel } from '../../hooks/useAutoScroll';
import { createMishnahJoinStyles } from '../SefariaReader/mishnahJoin.styles';
import {
  CHAVRUTA_TEXT_SCROLL_GAP,
  createChavrutaTextContainerStyles,
} from './ChavrutaTextContainer.styles';

interface ChavrutaTextContainerProps {
  data: ChavrutaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReportError?: () => void;
  fontSize: number;
  showNotes: boolean;
  readerTheme?: ReaderTheme;
  accentColor?: string;
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

export default function ChavrutaTextContainer({
  data,
  loading,
  error,
  onRetry,
  onReportError,
  fontSize,
  showNotes,
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
}: ChavrutaTextContainerProps) {
  const theme = useTheme();
  const palette = useMemo(
    () => getReaderThemePalette(readerTheme ?? 'light', accentColor),
    [readerTheme, accentColor],
  );
  const styles = useMemo(
    () => createChavrutaTextContainerStyles(theme, palette),
    [theme, palette],
  );
  const mishnahJoinStyles = useMemo(
    () => createMishnahJoinStyles(theme, CHAVRUTA_TEXT_SCROLL_GAP),
    [theme],
  );
  const [activeFootnoteIndex, setActiveFootnoteIndex] = useState<number | null>(null);

  const resetKey = `${data?.masechetEn || ''}-${data?.dafNum || ''}-${data?.amud || ''}`;
  const { scrollViewRef, scrollYRef, showFab, handleScroll, handleScrollBeginDrag, handleContentSizeChange, scrollToTop, scrollToIndex } =
    useScrollProgress({
      progressShared: scrollProgress,
      resetKey,
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

  const footnotesById = useMemo(
    () => new Map((data?.footnotes ?? []).map((footnote) => [footnote.id, footnote])),
    [data?.footnotes],
  );

  const renderBlocks = useMemo<ChavrutaBlock[]>(() => {
    if (data?.blocks && data.blocks.length > 0) return data.blocks;
    return (data?.paragraphs ?? []).map((paragraph) => ({ kind: 'paragraph' as const, ...paragraph }));
  }, [data?.blocks, data?.paragraphs]);

  const mishnahFlags = useMemo(() => chavrutaMishnahFlags(renderBlocks), [renderBlocks]);
  const mishnahJoins = useMemo(() => mishnahJoinRoles(mishnahFlags), [mishnahFlags]);

  const openFootnote = useCallback((footnote: ChavrutaFootnote) => {
    const footnotes = data?.footnotes ?? [];
    const index = footnotes.findIndex((item) => item.id === footnote.id);
    setActiveFootnoteIndex(index >= 0 ? index : null);
  }, [data?.footnotes]);

  useEffect(() => {
    setActiveFootnoteIndex(null);
  }, [data?.masechetEn, data?.dafNum, data?.amud, showNotes]);

  useEffect(() => {
    if (!activeSearchSegmentId?.startsWith('p-')) return;
    const index = Number(activeSearchSegmentId.slice(2));
    if (Number.isNaN(index)) return;
    scrollToIndex(index);
  }, [activeSearchOccurrenceIndex, activeSearchSegmentId, scrollToIndex]);

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
      <View style={styles.headerBox}>
        <Text style={styles.titleHe}>{`חברותא · ${data?.titleHe ?? ''}`}</Text>
      </View>
    ),
    [data?.titleHe, styles.headerBox, styles.titleHe],
  );

  const renderItem = useCallback<ListRenderItem<ChavrutaBlock>>(
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
      if (block.kind === 'sectionHeader') {
        return <ChavrutaSectionHeader titleHe={block.titleHe} palette={palette} />;
      }
      const joinRole = mishnahJoins[index];
      const segmentId = `p-${index}`;
      const isActiveSearchMatch = activeSearchSegmentId === segmentId;
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
          <ChavrutaBodyText
            text={block.text}
            baseStyle={textStyle}
            fontSize={fontSize}
            accentColor={palette.accentColor}
            showNotes={showNotes}
            footnotesById={footnotesById}
            onPressFootnote={openFootnote}
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
      footnotesById,
      mishnahJoinStyles,
      mishnahJoins,
      openFootnote,
      palette,
      searchQuery,
      showNotes,
      styles.paragraph,
      styles.paragraphText,
    ],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ReaderSkeleton />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.errorTitle}>לא ניתן לטעון את חברותא</Text>
        <Text style={styles.errorSub}>{error || 'שגיאה בטעינת ביאור חברותא'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryBtnText}>נסה שוב</Text>
        </TouchableOpacity>
        {onReportError ? (
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={onReportError}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="דיווח על התקלה"
          >
            <Text style={styles.reportBtnText}>דיווח על התקלה</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (renderBlocks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.errorTitle}>לא נמצא ביאור חברותא לדף זה</Text>
        <Text style={styles.errorSub}>ניתן לקרוא את הגמרא בטאב גמרא או בשטיינזלץ.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={scrollViewRef as never}
        data={renderBlocks}
        keyExtractor={(block, index) =>
          block.kind === 'paragraph' ? `p-${index}` : `${block.kind}-${index}`
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

      <ChavrutaFootnoteSheet
        footnote={
          activeFootnoteIndex == null ? null : data.footnotes[activeFootnoteIndex] ?? null
        }
        onClose={() => setActiveFootnoteIndex(null)}
      />
    </View>
  );
}
