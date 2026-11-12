import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SharedValue } from 'react-native-reanimated';
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
  const segmentOffsetsRef = useRef<Map<string, number>>(new Map());

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
    if (!activeSearchSegmentId) return;
    const y = segmentOffsetsRef.current.get(activeSearchSegmentId);
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
      <ScrollView
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
          <Text style={[styles.titleHe, { color: palette.accentColor }]}>{`שטיינזלץ · ${data.titleHe}`}</Text>
        </View>

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
          const joinRole = mishnahJoins[index];
          const segmentId = block.item.ref;
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
              key={`${block.item.ref}-${index}`}
              onLayout={(event) => {
                const y = event.nativeEvent.layout.y;
                segmentOffsetsRef.current.set(segmentId, y);
                registerAnchor(index, y);
              }}
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
                activeOccurrenceIndex={
                  isActiveSearchMatch ? activeSearchOccurrenceIndex : null
                }
              />
            </View>
          );
        })}
      </ScrollView>

      <ScrollToTopFab
        visible={showFab}
        onPress={handleScrollToTop}
        accentColor={palette.accentColor}
      />
    </View>
  );
}
