import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import ReaderSkeleton from '../SefariaReader/ReaderSkeleton';
import ScrollToTopFab from '../SefariaReader/ScrollToTopFab';
import { useTheme } from '../../theme';
import type { ChavrutaBlock, ChavrutaFootnote, ChavrutaPageData } from '../../services/chavrutaApi';
import ChavrutaBodyText from './ChavrutaBodyText';
import ChavrutaFootnoteSheet from './ChavrutaFootnoteSheet';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { createChavrutaTextContainerStyles } from './ChavrutaTextContainer.styles';

interface ChavrutaTextContainerProps {
  data: ChavrutaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fontSize: number;
  showNotes: boolean;
  onScrollProgress?: (progress: number) => void;
}

export default function ChavrutaTextContainer({
  data,
  loading,
  error,
  onRetry,
  fontSize,
  showNotes,
  onScrollProgress,
}: ChavrutaTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaTextContainerStyles(theme), [theme]);
  const [activeFootnoteIndex, setActiveFootnoteIndex] = useState<number | null>(null);

  const resetKey = `${data?.masechetEn || ''}-${data?.dafNum || ''}-${data?.amud || ''}`;
  const { scrollViewRef, showFab, handleScroll, scrollToTop } =
    useScrollProgress({
      onProgressChange: onScrollProgress,
      resetKey,
    });

  const footnotesById = useMemo(
    () => new Map((data?.footnotes ?? []).map((footnote) => [footnote.id, footnote])),
    [data?.footnotes],
  );

  useEffect(() => {
    setActiveFootnoteIndex(null);
  }, [data?.masechetEn, data?.dafNum, data?.amud, showNotes]);

  if (loading) {
    return <ReaderSkeleton />;
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
      </View>
    );
  }

  const renderBlocks: ChavrutaBlock[] =
    data.blocks && data.blocks.length > 0
      ? data.blocks
      : data.paragraphs.map((paragraph) => ({ kind: 'paragraph', ...paragraph }));

  if (renderBlocks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.errorTitle}>לא נמצא ביאור חברותא לדף זה</Text>
        <Text style={styles.errorSub}>ניתן לקרוא את הגמרא בטאב גמרא או בשטיינזלץ.</Text>
      </View>
    );
  }

  const openFootnote = (footnote: ChavrutaFootnote) => {
    const index = data.footnotes.findIndex((item) => item.id === footnote.id);
    setActiveFootnoteIndex(index >= 0 ? index : null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.headerBox}>
          <Text style={styles.titleHe}>{`חברותא · ${data.titleHe}`}</Text>
        </View>

        {renderBlocks.map((block, index) => {
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
          return (
            <View key={`paragraph-${index}`} style={styles.paragraph}>
              <ChavrutaBodyText
                text={block.text}
                baseStyle={[
                  styles.paragraphText,
                  {
                    fontSize,
                    lineHeight: Math.round(fontSize * 1.7),
                  },
                ]}
                fontSize={fontSize}
                accentColor={theme.colors.accent}
                showNotes={showNotes}
                footnotesById={footnotesById}
                onPressFootnote={openFootnote}
              />
            </View>
          );
        })}
      </ScrollView>

      <ScrollToTopFab
        visible={showFab}
        onPress={scrollToTop}
        accentColor={theme.colors.accent}
      />

      <ChavrutaFootnoteSheet
        footnotes={data.footnotes}
        activeIndex={activeFootnoteIndex}
        onChangeIndex={setActiveFootnoteIndex}
        onClose={() => setActiveFootnoteIndex(null)}
      />
    </View>
  );
}
