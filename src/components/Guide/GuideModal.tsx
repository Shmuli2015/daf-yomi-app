import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';
import { triggerImpact } from '../../utils/haptics';
import InfoModal from '../InfoModal';
import GuideSection from './GuideSection';
import GuideTabToggle, { GuideTabType } from './GuideTabToggle';
import GuideFaqList from './GuideFaqList';
import GuideGesturesCard from './GuideGesturesCard';
import { GUIDE_SECTIONS, FAQ_CHIPS } from './guideData';
import { GUIDE_FAQ_ITEMS } from './guideFaqData';
import { createGuideModalStyles } from './GuideModal.styles';
import { useGuideExpandState } from './useGuideExpandState';
import { useSheetDismissGesture } from '../../hooks/useSheetDismissGesture';
import SheetDragHandle from '../SheetDragHandle';

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: GuideTabType;
  initialQuery?: string;
}

export function GuideModal({
  visible,
  onClose,
  initialTab = 'faq',
  initialQuery,
}: GuideModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideModalStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const heldTopInsetRef = useRef(insets.top);
  if (insets.top > 0) {
    heldTopInsetRef.current = insets.top;
  }
  const { panHandlers, sheetAnimatedStyle, overlayAnimatedStyle, animationType, dismiss } =
    useSheetDismissGesture({ visible, onClose });
  const [activeTab, setActiveTab] = useState<GuideTabType>(initialTab);
  const chipsScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [emailCopiedToast, setEmailCopiedToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollChipsToStart = useCallback(() => {
    requestAnimationFrame(() => {
      chipsScrollRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  useEffect(() => {
    if (visible) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialQuery !== undefined) {
        setSearchQuery(initialQuery);
        const matchingChip = FAQ_CHIPS.find(
          (c) =>
            c.query.toLowerCase() === initialQuery.toLowerCase() ||
            c.id === initialQuery.toLowerCase() ||
            initialQuery.toLowerCase().includes(c.query.toLowerCase()),
        );
        setActiveChipId(matchingChip ? matchingChip.id : null);
      } else {
        setSearchQuery('');
        setActiveChipId(null);
      }
      scrollChipsToStart();
      contentScrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      setSearchQuery('');
      setActiveChipId(null);
    }
  }, [visible, initialTab, initialQuery, scrollChipsToStart]);

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const copySupportEmail = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      triggerImpact('light');
      setEmailCopiedToast(true);
      setTimeout(() => setEmailCopiedToast(false), 2500);
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const handleChipPress = useCallback((chipId: string, query: string) => {
    if (activeChipId === chipId) {
      setActiveChipId(null);
      setSearchQuery('');
    } else {
      setActiveChipId(chipId);
      setSearchQuery(query);
    }
  }, [activeChipId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasSearch = normalizedQuery.length > 0;
  const {
    toggleSection,
    handleExpandAll,
    handleCollapseAll,
    allExpanded,
    noneExpanded,
    isSectionExpanded,
  } = useGuideExpandState(hasSearch, normalizedQuery);

  const filteredFaqItems = useMemo(() => {
    if (!hasSearch) return GUIDE_FAQ_ITEMS;

    return GUIDE_FAQ_ITEMS.filter((faq) => {
      return (
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery) ||
        faq.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [hasSearch, normalizedQuery]);

  const filteredSections = useMemo(() => {
    if (!hasSearch) return GUIDE_SECTIONS;

    return GUIDE_SECTIONS.map((sec) => {
      const titleMatch = sec.title.toLowerCase().includes(normalizedQuery);
      const matchingItems = sec.items.filter((item) =>
        item.toLowerCase().includes(normalizedQuery),
      );

      if (titleMatch) {
        return sec;
      }

      if (matchingItems.length > 0) {
        return {
          ...sec,
          items: matchingItems,
        };
      }

      return null;
    }).filter(Boolean) as typeof GUIDE_SECTIONS;
  }, [hasSearch, normalizedQuery]);

  const faqResultCount = filteredFaqItems.length;

  const guideResultCount = useMemo(
    () => filteredSections.reduce((acc, s) => acc + s.items.length, 0),
    [filteredSections],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveChipId(null);
  }, []);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType={animationType}
        onRequestClose={dismiss}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.overlayRoot}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.overlayDim, overlayAnimatedStyle]}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
          <View style={[styles.sheetLayer, { paddingTop: heldTopInsetRef.current + 8 }]} pointerEvents="box-none">
          <Animated.View
            pointerEvents="auto"
            style={[styles.sheetFill, sheetAnimatedStyle]}
          >
            <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
              <SheetDragHandle panHandlers={panHandlers} style={styles.handleSpacing} />
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>מדריך לשימוש באפליקציה</Text>
                  <Text style={styles.modalSubtitle}>כל התכונות והאפשרויות במקום אחד</Text>
                </View>
                <TouchableOpacity
                  onPress={dismiss}
                  style={styles.closeBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeBtnText}>סגירה</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stickyHeader}>
                <View style={styles.searchBox}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="חפש במדריך ובשאלות הנפוצות..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      if (activeChipId) setActiveChipId(null);
                    }}
                  />
                  {hasSearch && (
                    <TouchableOpacity
                      onPress={handleClearSearch}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={theme.colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <GuideTabToggle
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  faqCount={faqResultCount}
                  guideCount={guideResultCount}
                  hasSearch={hasSearch}
                />

                <ScrollView
                  ref={chipsScrollRef}
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipsScrollView}
                  contentContainerStyle={styles.chipsContainer}
                  onContentSizeChange={scrollChipsToStart}
                >
                  {FAQ_CHIPS.map((chip) => {
                    const isSelected = activeChipId === chip.id;
                    return (
                      <TouchableOpacity
                        key={chip.id}
                        onPress={() => handleChipPress(chip.id, chip.query)}
                        style={[
                          styles.faqChip,
                          isSelected && styles.faqChipSelected,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={chip.icon}
                          size={14}
                          color={isSelected ? theme.colors.accent : theme.colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.faqChipText,
                            isSelected && styles.faqChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <ScrollView
                ref={contentScrollRef}
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={(e) => {
                  const offsetY = e.nativeEvent.contentOffset.y;
                  if (offsetY > 250 && !showScrollTop) {
                    setShowScrollTop(true);
                  } else if (offsetY <= 250 && showScrollTop) {
                    setShowScrollTop(false);
                  }
                }}
                scrollEventThrottle={16}
              >
                {hasSearch && (
                  <View style={styles.searchResultsInfo}>
                    <Text style={styles.searchResultsText}>
                      נמצאו {activeTab === 'faq' ? faqResultCount : guideResultCount} תוצאות ב{activeTab === 'faq' ? 'שאלות הנפוצות' : 'מדריך המפורט'} עבור "{searchQuery}"
                    </Text>
                  </View>
                )}

                {!hasSearch && <GuideGesturesCard />}

                {activeTab === 'faq' ? (
                  <GuideFaqList
                    items={filteredFaqItems}
                    hasSearch={hasSearch}
                    searchQuery={searchQuery}
                    onClearSearch={handleClearSearch}
                    guideResultCount={guideResultCount}
                    onSwitchToGuide={() => setActiveTab('guide')}
                  />
                ) : (
                  <>
                    {!hasSearch && (
                      <View style={styles.controlsRow}>
                        <TouchableOpacity
                          onPress={handleExpandAll}
                          style={styles.controlBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="expand-outline"
                            size={14}
                            color={allExpanded ? theme.colors.textMuted : theme.colors.accent}
                          />
                          <Text style={allExpanded ? styles.controlBtnTextMuted : styles.controlBtnText}>
                            פתח הכל
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCollapseAll}
                          style={styles.controlBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="contract-outline"
                            size={14}
                            color={noneExpanded ? theme.colors.textMuted : theme.colors.accent}
                          />
                          <Text style={noneExpanded ? styles.controlBtnTextMuted : styles.controlBtnText}>
                            סגור הכל
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {filteredSections.length === 0 && (
                      <View style={styles.emptyState}>
                        <Ionicons
                          name="help-circle-outline"
                          size={48}
                          color={theme.colors.textMuted}
                        />
                        <Text style={styles.emptyTitle}>לא נמצאו תוצאות</Text>
                        <Text style={styles.emptySubtitle}>
                          לא מצאנו נושאים המתאימים לחיפוש "{searchQuery}".
                        </Text>
                        {faqResultCount > 0 && (
                          <TouchableOpacity
                            onPress={() => setActiveTab('faq')}
                            style={styles.switchTabResultBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="swap-horizontal-outline"
                              size={16}
                              color={theme.colors.accent}
                            />
                            <Text style={styles.switchTabResultBtnText}>
                              מעבר ל-{faqResultCount} תוצאות ב"שאלות נפוצות"
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={handleClearSearch}
                          style={styles.clearSearchBtn}
                        >
                          <Text style={styles.clearSearchBtnText}>נקה חיפוש</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {filteredSections.map((sec) => (
                      <GuideSection
                        key={sec.id}
                        id={sec.id}
                        icon={sec.icon}
                        title={sec.title}
                        items={sec.items}
                        theme={theme}
                        isExpanded={isSectionExpanded(sec.id)}
                        onToggle={toggleSection}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </>
                )}

                <View style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <View style={styles.contactIconWrap}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={22}
                        color={theme.colors.accent}
                      />
                    </View>
                    <View style={styles.contactHeaderTextWrap}>
                      <Text style={styles.contactTitle}>יצירת קשר ותמיכה</Text>
                      <Text style={styles.contactSubtitle}>
                        יש לך שאלה, הערה או הצעה לשיפור? נשמח לעזור תמיד.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={openSupportEmail}
                    onLongPress={copySupportEmail}
                    style={styles.contactEmailBox}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`שליחת דוא״ל אל ${SUPPORT_EMAIL}`}
                  >
                    <View style={styles.contactEmailRow}>
                      <Ionicons name="mail-outline" size={17} color={theme.colors.accent} />
                      <Text
                        style={styles.contactEmailText}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        selectable
                      >
                        {SUPPORT_EMAIL}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.contactActionsRow}>
                    <TouchableOpacity
                      onPress={openSupportEmail}
                      style={styles.contactSendBtn}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel="פתיחת אפליקציית דוא״ל"
                    >
                      <Ionicons name="paper-plane-outline" size={15} color={theme.colors.white} />
                      <Text style={styles.contactSendBtnText}>שליחת הודעה</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={copySupportEmail}
                      style={styles.contactCopyBtn}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel="העתקת כתובת דוא״ל"
                    >
                      <Ionicons
                        name={emailCopiedToast ? 'checkmark' : 'copy-outline'}
                        size={15}
                        color={theme.colors.accent}
                      />
                      <Text style={styles.contactCopyBtnText}>
                        {emailCopiedToast ? 'הועתק ללוח!' : 'העתקת כתובת'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoFooterCard}>
                  <View style={styles.infoFooterHeader}>
                    <Ionicons name="bulb-outline" size={18} color={theme.colors.accent} />
                    <Text style={styles.infoFooterTitle}>גישה מהירה ומידע נוסף</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoRowIcon}>
                      <Ionicons name="settings-outline" size={15} color={theme.colors.accent} />
                    </View>
                    <Text style={styles.infoRowText}>
                      ניתן לפתוח מדריך זה מחדש בכל עת דרך תפריט ההגדרות באפליקציה.
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoRowIcon}>
                      <Ionicons name="cloud-upload-outline" size={15} color={theme.colors.accent} />
                    </View>
                    <Text style={styles.infoRowText}>
                      במסך ההגדרות תוכלו לבצע גיבוי ושחזור, לנהל קבצים שמורים ולבדוק עדכונים.
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.footerWishBanner}>
                    <Ionicons name="sparkles" size={15} color={theme.colors.accent} />
                    <Text style={styles.footerWishText}>לימוד פורה ומאיר בכל מרחבי הש״ס!</Text>
                  </View>
                </View>

                <View style={{ height: 84 }} />
              </ScrollView>

              {showScrollTop && (
                <TouchableOpacity
                  style={[
                    styles.scrollToTopBtn,
                    { bottom: Math.max(insets.bottom, 48) + 16 },
                  ]}
                  onPress={() => contentScrollRef.current?.scrollTo({ y: 0, animated: true })}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="חזרה לראש המדריך"
                >
                  <Ionicons name="arrow-up" size={20} color={theme.colors.accent} />
                </TouchableOpacity>
              )}
            </SafeAreaView>
          </Animated.View>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={mailHintVisible}
        onClose={() => setMailHintVisible(false)}
        title="אפליקציית הדוא״ל לא נפתחה"
        message="במכשירים מסוימים לא מתבצעת הפניה אוטומטית לאפליקציית הדוא״ל. באפשרותך להעתיק את הכתובת המופיעה מטה ולשלוח אלינו הודעה באופן ידני."
        emphasis={SUPPORT_EMAIL}
      />
    </>
  );
}

export default GuideModal;
