import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import type { SefariaPageData } from '../../services/sefariaTextApi';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import SegmentCard from './SegmentCard';
import ReaderSkeleton from './ReaderSkeleton';
import ScrollToTopFab from './ScrollToTopFab';
import type { ReaderTheme } from './ReaderToolbar';
import { useTheme } from '../../theme';
import { insertChapterBoundaries } from '../../utils/chapterBoundaries';
import { classicCommentatorKeysForTref, filterCommentaries } from '../../utils/sefariaCommentators';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useCommentaryCollapseScroll } from '../../hooks/useCommentaryCollapseScroll';
import { createSefariaTextContainerStyles } from './SefariaTextContainer.styles';

interface SefariaTextContainerProps {
  data: SefariaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fontSize: number;
  readerTheme?: ReaderTheme;
  accentColor: string;
  classicTabLabel?: string;
  onScrollProgress?: (progress: number) => void;
}

export default function SefariaTextContainer({
  data,
  loading,
  error,
  onRetry,
  fontSize,
  readerTheme,
  accentColor,
  classicTabLabel = 'גמרא',
  onScrollProgress,
}: SefariaTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSefariaTextContainerStyles(theme), [theme]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const { scrollViewRef, scrollYRef, showFab, handleScroll, scrollToTop } =
    useScrollProgress({
      onProgressChange: onScrollProgress,
      resetKey: data?.tref || '',
    });

  const { registerCardLayout, registerCommentaryHeight, beginCollapse, collapseScroll, closingIndex } =
    useCommentaryCollapseScroll({
      scrollViewRef,
      scrollYRef,
      resetKey: data?.tref || '',
    });

  const toggleExpand = useCallback((index: number, nextSegmentIndex: number | null) => {
    if (expandedIndices.has(index)) {
      beginCollapse(index, nextSegmentIndex);
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
  }, [beginCollapse, expandedIndices]);

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

  const isDark = readerTheme ? readerTheme === 'dark' : theme.colors.background === '#121212';
  const isSepia = readerTheme === 'sepia';
  const bgColor = isSepia ? '#FBF0D9' : theme.colors.background;
  const textColor = isSepia ? '#2C221E' : theme.colors.textPrimary;
  const subTextColor = isSepia ? '#8C7462' : theme.colors.textMuted;

  if (loading) {
    return <ReaderSkeleton />;
  }

  if (error || !data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={subTextColor} />
        <Text style={[styles.errorTitle, { color: textColor }]}>לא ניתן לטעון את הטקסט</Text>
        <Text style={[styles.errorSub, { color: subTextColor }]}>
          {error || 'שגיאה בטעינת הטקסט'}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: accentColor }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryBtnText}>נסה שוב</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (data.segments.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="book-outline" size={48} color={subTextColor} />
        <Text style={[styles.errorTitle, { color: textColor }]}>לא נמצא טקסט גמרא לדף זה</Text>
        <Text style={[styles.errorSub, { color: subTextColor }]}>
          ניתן לנסות טאב אחר, או דף אחר במסכת.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.headerBox}>
          <Text style={[styles.titleHe, { color: accentColor }]}>{data.titleHe}</Text>
        </View>

        {blocks.map((block, index) => {
          if (block.kind === 'chapterStart') {
            return (
              <ChapterBoundaryMarker
                key={`chapter-start-${index}`}
                kind="start"
                titleHe={block.titleHe}
                chapterNumber={block.chapterNumber}
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
              accentColor={accentColor}
              isExpanded={isExpanded}
              isClosing={closingIndex === segment.index}
              onToggleExpand={() =>
                toggleExpand(segment.index, nextSegmentIndexByIndex.get(segment.index) ?? null)
              }
              onCardLayout={(y, height) => registerCardLayout(segment.index, y, height)}
              onCommentaryLayout={(height) => registerCommentaryHeight(segment.index, height)}
              collapseScroll={collapseScroll}
              isSepia={isSepia}
              isDark={isDark}
            />
          );
        })}
      </Animated.ScrollView>

      <ScrollToTopFab
        visible={showFab}
        onPress={scrollToTop}
        accentColor={accentColor}
      />
    </View>
  );
}
