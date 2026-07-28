import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SefariaCommentaryItem } from '../../services/sefariaTextApi';

interface CommentaryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  segmentTitle: string;
  segmentText: string;
  commentaries: SefariaCommentaryItem[];
  themeMode: 'light' | 'dark' | 'sepia';
  accentColor: string;
}

type FilterTab = 'all' | 'rashi' | 'steinsaltz';

export default function CommentaryBottomSheet({
  visible,
  onClose,
  segmentTitle,
  segmentText,
  commentaries,
  themeMode,
  accentColor,
}: CommentaryBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.sheetContainer, { backgroundColor: bgColor, borderColor }]}>
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: subTextColor }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.headerTitle, { color: textColor }]}>פירושים וביאורים</Text>
              <Text style={[styles.headerSub, { color: subTextColor }]}>{segmentTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={26} color={subTextColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.segmentQuote, { backgroundColor: quoteBg, borderStartColor: accentColor }]}>
            <ScrollView style={{ maxHeight: 120 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
              <Text style={[styles.segmentQuoteText, { color: textColor }]}>
                {`\u200F${segmentText}`}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.tabsContainer}>
            {[
              { id: 'all', label: `הכל (${commentaries.length})` },
              { id: 'rashi', label: 'רש״י' },
              { id: 'steinsaltz', label: 'שטיינזלץ' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const count = commentaries.filter(c => tab.id === 'all' || c.commentator === tab.id).length;
              if (tab.id !== 'all' && count === 0) return null;

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabBtn,
                    { borderColor },
                    isActive && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => setActiveTab(tab.id as FilterTab)}
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

          <ScrollView
            style={styles.contentScroll}
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
                  <Text style={[styles.commText, { color: textColor }]}>{`\u200F${item.he}`}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '75%',
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
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
    flex: 1,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 30,
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
