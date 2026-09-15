import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContentLicensesModal from '../Settings/ContentLicensesModal';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import ReaderAttribution from '../SefariaReader/ReaderAttribution';
import { CHAVRUTA_ATTRIBUTION_SHORT } from '../../data/contentLicenses';
import { useTheme } from '../../theme';
import type { ChavrutaBlock, ChavrutaFootnote, ChavrutaPageData } from '../../services/chavrutaApi';
import ChavrutaBodyText from './ChavrutaBodyText';
import ChavrutaFootnoteSheet from './ChavrutaFootnoteSheet';
import { createChavrutaTextContainerStyles } from './ChavrutaTextContainer.styles';

interface ChavrutaTextContainerProps {
  data: ChavrutaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fontSize: number;
  showNotes: boolean;
}

export default function ChavrutaTextContainer({
  data,
  loading,
  error,
  onRetry,
  fontSize,
  showNotes,
}: ChavrutaTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaTextContainerStyles(theme), [theme]);
  const [licensesVisible, setLicensesVisible] = useState(false);
  const [activeFootnoteIndex, setActiveFootnoteIndex] = useState<number | null>(null);

  const footnotesById = useMemo(
    () => new Map((data?.footnotes ?? []).map((footnote) => [footnote.id, footnote])),
    [data?.footnotes]
  );

  useEffect(() => {
    setActiveFootnoteIndex(null);
  }, [data?.masechetEn, data?.dafNum, data?.amud, showNotes]);

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>טוען את חברותא...</Text>
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

  const pageKey = `${data.masechetEn}-${data.dafNum}-${data.amud}`;

  return (
    <View style={styles.container}>
      <ScrollView
        key={pageKey}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
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

        <ReaderAttribution
          lines={[CHAVRUTA_ATTRIBUTION_SHORT]}
          textColor={theme.colors.textMuted}
          accentColor={theme.colors.accent}
          onPress={() => setLicensesVisible(true)}
        />
      </ScrollView>

      <ContentLicensesModal
        visible={licensesVisible}
        onClose={() => setLicensesVisible(false)}
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
