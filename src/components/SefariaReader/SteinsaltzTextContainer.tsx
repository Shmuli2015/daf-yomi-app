import React, { useMemo } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import CommentaryBodyText from './CommentaryBodyText';
import ReaderSkeleton from './ReaderSkeleton';
import ScrollToTopFab from './ScrollToTopFab';
import type { SefariaPageData } from '../../services/sefariaTextApi';
import { insertChapterBoundaries } from '../../utils/chapterBoundaries';
import { collectCommentariesWithIndex } from '../../utils/sefariaCommentators';
import { useTheme } from '../../theme';
import { isMishnahHeading } from '../../utils/commentaryEmphasis';
import type { ReaderTheme } from './ReaderToolbar';
import { getReaderThemePalette } from '../../utils/readerTheme';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { createSteinsaltzTextContainerStyles } from './SteinsaltzTextContainer.styles';

function isMishnahSteinsaltz(text: string): boolean {
  return /\*\*(?:[א-ת]\s+)?משנה\*\*/.test(text) || isMishnahHeading(text);
}

interface SteinsaltzTextContainerProps {
  data: SefariaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fontSize: number;
  readerTheme?: ReaderTheme;
  accentColor: string;
  onScrollProgress?: (progress: number) => void;
}

export default function SteinsaltzTextContainer({
  data,
  loading,
  error,
  onRetry,
  fontSize,
  readerTheme,
  accentColor,
  onScrollProgress,
}: SteinsaltzTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSteinsaltzTextContainerStyles(theme), [theme]);

  const { scrollViewRef, showFab, handleScroll, scrollToTop } =
    useScrollProgress({
      onProgressChange: onScrollProgress,
      resetKey: data?.tref || '',
    });

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
          const isMishnah = isMishnahSteinsaltz(block.item.he);
          return (
            <View
              key={`${block.item.ref}-${index}`}
              style={[
                styles.paragraph,
                isMishnah && [styles.mishnahParagraph, { borderRightColor: palette.accentColor }],
              ]}
            >
              <CommentaryBodyText
                text={block.item.he}
                commentator="steinsaltz"
                baseStyle={[
                  styles.paragraphText,
                  {
                    color: palette.textColor,
                    fontSize,
                    lineHeight: Math.round(fontSize * 1.7),
                  },
                ]}
                accentColor={palette.accentColor}
              />
            </View>
          );
        })}
      </ScrollView>

      <ScrollToTopFab
        visible={showFab}
        onPress={scrollToTop}
        accentColor={palette.accentColor}
      />
    </View>
  );
}
