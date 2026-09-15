import React, { useMemo, useState } from 'react';
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
import CommentaryBodyText from './CommentaryBodyText';
import ReaderAttribution from './ReaderAttribution';
import {
  COMMENTARY_ATTRIBUTION_SHORT,
  SEFARIA_INDEPENDENCE_NOTE,
} from '../../data/contentLicenses';
import type { SefariaPageData } from '../../services/sefariaTextApi';
import { insertChapterBoundaries } from '../../utils/chapterBoundaries';
import { collectCommentariesWithIndex } from '../../utils/sefariaCommentators';
import { useTheme } from '../../theme';
import type { ReaderTheme } from './ReaderToolbar';
import { createSteinsaltzTextContainerStyles } from './SteinsaltzTextContainer.styles';

interface SteinsaltzTextContainerProps {
  data: SefariaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fontSize: number;
  readerTheme?: ReaderTheme;
  accentColor: string;
}

export default function SteinsaltzTextContainer({
  data,
  loading,
  error,
  onRetry,
  fontSize,
  readerTheme,
  accentColor,
}: SteinsaltzTextContainerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSteinsaltzTextContainerStyles(theme), [theme]);
  const [licensesVisible, setLicensesVisible] = useState(false);

  const isSepia = readerTheme === 'sepia';
  const bgColor = isSepia ? theme.colors.surface : theme.colors.background;
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
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={styles.loadingText}>טוען את שטיינזלץ...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.errorTitle}>לא ניתן לטעון את שטיינזלץ</Text>
        <Text style={styles.errorSub}>{error || 'שגיאה בטעינת ביאור שטיינזלץ'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryBtnText}>נסה שוב</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (paragraphs.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="reader-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.errorTitle}>לא נמצא ביאור שטיינזלץ לדף זה</Text>
        <Text style={styles.errorSub}>ניתן לקרוא את הגמרא בטאב גמרא או בחברותא.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <View style={styles.headerBox}>
          <Text style={styles.titleHe}>{`שטיינזלץ · ${data.titleHe}`}</Text>
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
          return (
            <View key={`${block.item.ref}-${index}`} style={styles.paragraph}>
              <CommentaryBodyText
                text={block.item.he}
                commentator="steinsaltz"
                baseStyle={[
                  styles.paragraphText,
                  {
                    fontSize,
                    lineHeight: Math.round(fontSize * 1.7),
                  },
                ]}
                accentColor={accentColor}
              />
            </View>
          );
        })}

        <ReaderAttribution
          lines={[COMMENTARY_ATTRIBUTION_SHORT, SEFARIA_INDEPENDENCE_NOTE]}
          textColor={theme.colors.textMuted}
          accentColor={accentColor}
          onPress={() => setLicensesVisible(true)}
        />
      </ScrollView>

      <ContentLicensesModal
        visible={licensesVisible}
        onClose={() => setLicensesVisible(false)}
      />
    </View>
  );
}
