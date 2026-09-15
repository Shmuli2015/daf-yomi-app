import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SefariaCommentaryItem } from '../../services/sefariaTextApi';
import { useSheetDismissGesture } from '../../hooks/useSheetDismissGesture';
import CommentaryBodyText from './CommentaryBodyText';
import CommentarySegmentNav from './CommentarySegmentNav';
import SheetDragHandle from '../SheetDragHandle';
import {
  CLASSIC_COMMENTATOR_KEYS,
  COMMENTATOR_TITLE_HE,
  MISHNAH_COMMENTATOR_KEYS,
  SHEKALIM_COMMENTATOR_KEYS,
  TAMID_COMMENTATOR_KEYS,
  type SefariaCommentatorKey,
} from '../../utils/sefariaCommentators';

interface CommentaryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  segmentTitle: string;
  segmentText: string;
  segmentNumber: number;
  totalSegments: number;
  commentaries: SefariaCommentaryItem[];
  hasPrevSegment: boolean;
  hasNextSegment: boolean;
  onPrevSegment: () => void;
  onNextSegment: () => void;
  themeMode: 'light' | 'dark' | 'sepia';
  accentColor: string;
}

type FilterTab = 'all' | SefariaCommentatorKey;

function commentaryFilterTabs(
  commentaries: SefariaCommentaryItem[],
): Array<{ id: FilterTab; label: string }> {
  const present = new Set(commentaries.map((item) => item.commentator));
  const ordered = [
    ...CLASSIC_COMMENTATOR_KEYS,
    ...SHEKALIM_COMMENTATOR_KEYS,
    ...MISHNAH_COMMENTATOR_KEYS,
    ...TAMID_COMMENTATOR_KEYS,
  ].filter((key) => present.has(key));
  return [
    { id: 'all', label: `הכל (${commentaries.length})` },
    ...ordered.map((key) => ({ id: key, label: COMMENTATOR_TITLE_HE[key] })),
  ];
}

export default function CommentaryBottomSheet({
  visible,
  onClose,
  segmentTitle,
  segmentText,
  segmentNumber,
  totalSegments,
  commentaries,
  hasPrevSegment,
  hasNextSegment,
  onPrevSegment,
  onNextSegment,
  themeMode,
  accentColor,
}: CommentaryBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [chromeHeight, setChromeHeight] = useState(220);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetMaxHeight = windowHeight * 0.85;
  const contentMaxHeight = Math.max(96, sheetMaxHeight - chromeHeight - insets.bottom - 8);

  useEffect(() => {
    setActiveTab((current) => {
      if (current === 'all') return current;
      const hasTab = commentaries.some((item) => item.commentator === current);
      return hasTab ? current : 'all';
    });
  }, [segmentNumber, commentaries]);

  const filtered = commentaries.filter((c) => {
    if (activeTab === 'all') return true;
    return c.commentator === activeTab;
  });

  const isDark = themeMode === 'dark';
  const isSepia = themeMode === 'sepia';

  const bgColor = isDark ? '#1C1C1E' : isSepia ? '#FAF4EA' : '#FFFFFF';
  const textColor = isDark ? '#F2F2F7' : isSepia ? '#2C221E' : '#1C1C1E';
  const subTextColor = isDark ? '#A1A1AA' : isSepia ? '#786254' : '#71717A';
  const borderColor = isDark ? '#2C2C2E' : isSepia ? '#E6D5B8' : '#E5E7EB';
  const quoteBg = isDark ? '#2C2C2E' : isSepia ? '#F4E9D5' : '#F3F4F6';
  const { panHandlers, sheetAnimatedStyle, overlayAnimatedStyle, animationType } =
    useSheetDismissGesture({ visible, onClose });

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.overlayDim, overlayAnimatedStyle]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheetLayer} pointerEvents="box-none">
        <Animated.View
          pointerEvents="auto"
          style={[
            styles.sheetContainer,
            { backgroundColor: bgColor, borderColor, maxHeight: sheetMaxHeight },
            sheetAnimatedStyle,
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.sheetInner}>
          <View
            onLayout={(event) => {
              const nextHeight = Math.round(event.nativeEvent.layout.height);
              setChromeHeight((current) => (current === nextHeight ? current : nextHeight));
            }}
          >
          <SheetDragHandle panHandlers={panHandlers} color={subTextColor} />
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.headerTitle, { color: textColor }]}>פירושים וביאורים</Text>
              <Text style={[styles.headerSub, { color: subTextColor }]}>{segmentTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={26} color={subTextColor} />
            </TouchableOpacity>
          </View>

          <CommentarySegmentNav
            segmentNumber={segmentNumber}
            totalSegments={totalSegments}
            hasPrev={hasPrevSegment}
            hasNext={hasNextSegment}
            onPrev={onPrevSegment}
            onNext={onNextSegment}
            textColor={textColor}
            subTextColor={subTextColor}
            borderColor={borderColor}
            accentColor={accentColor}
          />

          <View style={[styles.segmentQuote, { backgroundColor: quoteBg, borderStartColor: accentColor }]}>
            <ScrollView style={{ maxHeight: 120 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
              <CommentaryBodyText
                text={segmentText}
                baseStyle={[styles.segmentQuoteText, { color: textColor }]}
                accentColor={accentColor}
              />
            </ScrollView>
          </View>

          <View style={styles.tabsContainer}>
            {commentaryFilterTabs(commentaries).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabBtn,
                    { borderColor },
                    isActive && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: subTextColor },
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {`\u200F${tab.label}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          </View>

          <ScrollView
            key={segmentNumber}
            style={[styles.contentScroll, { maxHeight: contentMaxHeight }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="information-circle-outline" size={36} color={subTextColor} />
                <Text style={[styles.emptyText, { color: subTextColor }]}>
                  {`\u200Fלא נמצאו פירושים לרובריקה זו בקטגוריה הנבחרת.`}
                </Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <View key={idx} style={[styles.commCard, { borderColor, backgroundColor: isDark ? '#262629' : isSepia ? '#FAF0DD' : '#F9FAFB' }]}>
                  <View style={styles.commHeader}>
                    <View style={[styles.badge, { backgroundColor: accentColor }]}>
                      <Text style={styles.badgeText}>{`\u200F${item.titleHe}`}</Text>
                    </View>
                  </View>
                  <CommentaryBodyText
                    text={item.he}
                    commentator={item.commentator}
                    baseStyle={[styles.commText, { color: textColor }]}
                    accentColor={accentColor}
                  />
                </View>
              ))
            )}
          </ScrollView>
          </SafeAreaView>
        </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayDim: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    direction: 'rtl',
  },
  sheetInner: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleGroup: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    writingDirection: 'rtl',
  },
  closeBtn: {
    padding: 2,
  },
  segmentQuote: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderStartWidth: 4,
  },
  segmentQuoteText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
    writingDirection: 'rtl',
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentScroll: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 0,
    paddingBottom: 24,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  commCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  commHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  commText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
    writingDirection: 'rtl',
  },
});
