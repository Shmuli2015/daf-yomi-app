import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SefariaCommentaryItem, SefariaPageData, SefariaSegment } from '../../services/sefariaTextApi';
import ChapterBoundaryMarker from '../ChapterBoundaryMarker';
import CommentaryBodyText from './CommentaryBodyText';
import CommentaryBottomSheet from './CommentaryBottomSheet';
import ReaderAttribution from './ReaderAttribution';
import {
  MISHNAH_ATTRIBUTION_SHORT,
  READER_ATTRIBUTION_SHORT,
  SEFARIA_INDEPENDENCE_NOTE,
} from '../../data/contentLicenses';
import ContentLicensesModal from '../Settings/ContentLicensesModal';
import type { ReaderTheme } from './ReaderToolbar';
import { useTheme } from '../../theme';
import { insertChapterBoundaries } from '../../utils/chapterBoundaries';
import { findAdjacentCommentedSegmentIndex } from '../../utils/commentarySegments';
import { classicCommentatorKeysForTref, filterCommentaries } from '../../utils/sefariaCommentators';

interface SefariaTextContainerProps {
  data: SefariaPageData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  fontSize: number;
  readerTheme?: ReaderTheme;
  accentColor: string;
  classicTabLabel?: string;
}

function getCommentaryLabel(commList: SefariaCommentaryItem[]): string {
  if (!commList || commList.length === 0) return '';
  const commentators = Array.from(new Set(commList.map((c) => c.titleHe))).filter(Boolean);
  if (commentators.length === 1) {
    return `פירוש ${commentators[0]}`;
  }
  return `${commentators.length} פירושים (${commentators.join(', ')})`;
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
}: SefariaTextContainerProps) {
  const theme = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<SefariaSegment | null>(null);
  const [licensesVisible, setLicensesVisible] = useState(false);
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

  const isDark = readerTheme ? readerTheme === 'dark' : theme.colors.background === '#121212';
  const isSepia = readerTheme === 'sepia';

  const bgColor = isSepia ? '#FBF0D9' : theme.colors.background;
  const textColor = isSepia ? '#2C221E' : theme.colors.textPrimary;
  const subTextColor = isSepia ? '#8C7462' : theme.colors.textMuted;
  const cardBg = isSepia ? '#F5E9D0' : theme.colors.surface;
  const borderColor = isSepia ? '#E6D5B8' : theme.colors.border;

  const badgeBg = isSepia
    ? 'rgba(180, 83, 9, 0.08)'
    : isDark
      ? 'rgba(245, 158, 11, 0.12)'
      : `${accentColor}12`;

  const badgeBorder = isSepia
    ? 'rgba(180, 83, 9, 0.2)'
    : isDark
      ? 'rgba(245, 158, 11, 0.25)'
      : `${accentColor}30`;

  const badgeTextColor = isSepia
    ? '#92400E'
    : isDark
      ? '#FBBF24'
      : accentColor;

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: subTextColor }]}>
          {`טוען את ה${classicTabLabel}...`}
        </Text>
      </View>
    );
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

  const prevCommentedIndex = selectedSegment
    ? findAdjacentCommentedSegmentIndex(
        data.segments.length,
        classicCommentaries,
        selectedSegment.index,
        -1,
      )
    : null;
  const nextCommentedIndex = selectedSegment
    ? findAdjacentCommentedSegmentIndex(
        data.segments.length,
        classicCommentaries,
        selectedSegment.index,
        1,
      )
    : null;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
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
          const hasCommentary = commList.length > 0;

          return (
            <TouchableOpacity
              key={`${segment.index}-${index}`}
              style={[
                styles.segmentCard,
                { backgroundColor: cardBg, borderColor },
                selectedSegment?.index === segment.index && { borderColor: accentColor, borderWidth: 1.5 },
              ]}
              onPress={() => {
                if (hasCommentary) {
                  setSelectedSegment(segment);
                }
              }}
              activeOpacity={hasCommentary ? 0.7 : 1}
            >
              {segment.mishnahLabel ? (
                <Text style={[styles.mishnahLabel, { color: accentColor }]}>
                  {`\u200F${segment.mishnahLabel}`}
                </Text>
              ) : null}
              <CommentaryBodyText
                text={segment.he}
                baseStyle={[
                  styles.segmentText,
                  {
                    color: textColor,
                    fontSize,
                    lineHeight: Math.round(fontSize * 1.6),
                  },
                ]}
                accentColor={accentColor}
              />

              {hasCommentary && (
                <View style={styles.commentaryBadgeRow}>
                  <View style={[styles.commBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                    <Ionicons name="chatbubbles" size={13} color={badgeTextColor} />
                    <Text style={[styles.commBadgeText, { color: badgeTextColor }]}>
                      {`\u200F${getCommentaryLabel(commList)}`}
                    </Text>
                    <Ionicons name="chevron-back" size={12} color={badgeTextColor} style={styles.chevronIcon} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <ReaderAttribution
          lines={[
            data.tref.includes('Mishnah_Kinnim') || data.tref.includes('Mishnah_Middot')
              ? MISHNAH_ATTRIBUTION_SHORT
              : READER_ATTRIBUTION_SHORT,
            SEFARIA_INDEPENDENCE_NOTE,
          ]}
          textColor={subTextColor}
          borderColor={borderColor}
          accentColor={accentColor}
          onPress={() => setLicensesVisible(true)}
        />
      </ScrollView>

      <ContentLicensesModal
        visible={licensesVisible}
        onClose={() => setLicensesVisible(false)}
      />

      {selectedSegment && (
        <CommentaryBottomSheet
          visible={selectedSegment !== null}
          onClose={() => setSelectedSegment(null)}
          segmentTitle={
            selectedSegment.mishnahLabel
              ? `${data.titleHe} (${selectedSegment.mishnahLabel})`
              : `${data.titleHe} (פיסקה ${selectedSegment.index + 1})`
          }
          segmentText={selectedSegment.he}
          segmentNumber={selectedSegment.index + 1}
          totalSegments={data.segments.length}
          commentaries={classicCommentaries[selectedSegment.index] || []}
          hasPrevSegment={prevCommentedIndex !== null}
          hasNextSegment={nextCommentedIndex !== null}
          onPrevSegment={() => {
            if (prevCommentedIndex !== null) {
              setSelectedSegment(data.segments[prevCommentedIndex]);
            }
          }}
          onNextSegment={() => {
            if (nextCommentedIndex !== null) {
              setSelectedSegment(data.segments[nextCommentedIndex]);
            }
          }}
          themeMode={isSepia ? 'sepia' : isDark ? 'dark' : 'light'}
          accentColor={accentColor}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  errorSub: {
    fontSize: 13,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  headerBox: {
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    marginBottom: 4,
  },
  titleHe: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  segmentCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    alignItems: 'stretch',
  },
  mishnahLabel: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    width: '100%',
  },
  segmentText: {
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    width: '100%',
  },
  commentaryBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  commBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  commBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
    writingDirection: 'rtl',
  },
  chevronIcon: {
    opacity: 0.8,
    marginRight: -2,
  },
});
