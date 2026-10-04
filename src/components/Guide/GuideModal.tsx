import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { SUPPORT_EMAIL } from '../../supportContact';
import InfoModal from '../InfoModal';
import SheetDragHandle from '../SheetDragHandle';
import { useSheetDismissGesture } from '../../hooks/useSheetDismissGesture';
import GuideHeader from './GuideHeader';
import GuideSearchBar from './GuideSearchBar';
import GuideTabToggle, { type GuideTabType } from './GuideTabToggle';
import GuideFaqTab from './GuideFaqTab';
import GuideDetailedTab from './GuideDetailedTab';
import GuideContactCard from './GuideContactCard';
import GuideScrollTopButton from './GuideScrollTopButton';
import { useGuideSearch } from './useGuideSearch';
import { useSupportContact } from './useSupportContact';
import { useGuideExpandState } from './useGuideExpandState';
import { useGuideFaqState } from './useGuideFaqState';
import { useGuideScrollAnchors } from './useGuideScrollAnchors';
import { GUIDE_CATEGORIES, type GuideCategoryId } from './guideCategories';
import { createGuideModalStyles } from './GuideModal.styles';

export interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: GuideTabType;
  initialCategory?: GuideCategoryId;
}

export function GuideModal({
  visible,
  onClose,
  initialTab = 'faq',
  initialCategory,
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
  const contentScrollRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    searchKey,
    hasSearch,
    highlightRegex,
    activeCategoryId,
    selectCategory,
    filteredFaqItems,
    searchedFaqCount,
    categoryCounts,
    filteredSections,
    guideResultCount,
  } = useGuideSearch({ visible, initialCategory });

  const {
    mailHintVisible,
    emailCopied,
    openSupportEmail,
    copySupportEmail,
    dismissMailHint,
  } = useSupportContact();

  const {
    toggleSection,
    expandSection,
    handleExpandAll: handleExpandAllSections,
    handleCollapseAll: handleCollapseAllSections,
    allExpanded: allSectionsExpanded,
    noneExpanded: noneSectionsExpanded,
    isSectionExpanded,
  } = useGuideExpandState(hasSearch, searchKey);

  const {
    toggleFaq,
    expandFaq,
    handleExpandAllFaq,
    handleCollapseAllFaq,
    allFaqExpanded,
    noneFaqExpanded,
    isFaqExpanded,
  } = useGuideFaqState(filteredFaqItems, hasSearch, searchKey);

  const { onContainerLayout, registerAnchor, getAnchorOffset } = useGuideScrollAnchors();

  useEffect(() => {
    if (visible) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      contentScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [visible, initialTab]);

  const handleSelectPopularTopic = useCallback(
    (categoryId: GuideCategoryId, faqId: string) => {
      selectCategory(categoryId);
      expandFaq(faqId);
      requestAnimationFrame(() => {
        const offset = getAnchorOffset(faqId);
        if (offset !== null) {
          contentScrollRef.current?.scrollTo({ y: Math.max(0, offset - 12), animated: true });
        }
      });
    },
    [expandFaq, getAnchorOffset, selectCategory],
  );

  const handleSelectQuickNav = useCallback(
    (sectionId: string) => {
      expandSection(sectionId);
      requestAnimationFrame(() => {
        const offset = getAnchorOffset(sectionId);
        if (offset !== null) {
          contentScrollRef.current?.scrollTo({ y: Math.max(0, offset - 12), animated: true });
        }
      });
    },
    [expandSection, getAnchorOffset],
  );

  const handleScrollToTop = useCallback(() => {
    contentScrollRef.current?.scrollTo({ y: 0, animated: true });
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

          <View
            style={[styles.sheetLayer, { paddingTop: heldTopInsetRef.current + 8 }]}
            pointerEvents="box-none"
          >
            <Animated.View pointerEvents="auto" style={[styles.sheetFill, sheetAnimatedStyle]}>
              <SafeAreaView style={styles.modalSafe} edges={['bottom']}>
                <SheetDragHandle panHandlers={panHandlers} style={styles.handleSpacing} />

                <GuideHeader
                  onClose={dismiss}
                  faqCount={searchedFaqCount}
                  categoryCount={GUIDE_CATEGORIES.length}
                />

                <View style={styles.stickyHeader}>
                  <GuideSearchBar
                    query={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={clearSearch}
                  />

                  <GuideTabToggle
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                    faqCount={searchedFaqCount}
                    guideCount={guideResultCount}
                    hasSearch={hasSearch}
                  />
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
                        נמצאו {activeTab === 'faq' ? searchedFaqCount : guideResultCount} תוצאות
                        ב{activeTab === 'faq' ? 'שאלות הנפוצות' : 'מדריך המפורט'} עבור "{searchQuery}"
                      </Text>
                    </View>
                  )}

                  <View onLayout={onContainerLayout}>
                    {activeTab === 'faq' ? (
                      <GuideFaqTab
                        items={filteredFaqItems}
                        totalFaqCount={searchedFaqCount}
                        categoryCounts={categoryCounts}
                        activeCategoryId={activeCategoryId}
                        onSelectCategory={selectCategory}
                        onSelectPopularTopic={handleSelectPopularTopic}
                        hasSearch={hasSearch}
                        searchQuery={searchQuery}
                        onClearSearch={clearSearch}
                        guideResultCount={guideResultCount}
                        onSwitchToGuide={() => setActiveTab('guide')}
                        onAskSupport={openSupportEmail}
                        isItemExpanded={isFaqExpanded}
                        onToggleItem={toggleFaq}
                        onExpandAll={handleExpandAllFaq}
                        onCollapseAll={handleCollapseAllFaq}
                        allExpanded={allFaqExpanded}
                        noneExpanded={noneFaqExpanded}
                        highlightRegex={highlightRegex}
                        onRegisterAnchor={registerAnchor}
                      />
                    ) : (
                      <GuideDetailedTab
                        sections={filteredSections}
                        hasSearch={hasSearch}
                        searchQuery={searchQuery}
                        onClearSearch={clearSearch}
                        faqResultCount={searchedFaqCount}
                        onSwitchToFaq={() => setActiveTab('faq')}
                        onAskSupport={openSupportEmail}
                        isSectionExpanded={isSectionExpanded}
                        onToggleSection={toggleSection}
                        onExpandAll={handleExpandAllSections}
                        onCollapseAll={handleCollapseAllSections}
                        allExpanded={allSectionsExpanded}
                        noneExpanded={noneSectionsExpanded}
                        onSelectQuickNav={handleSelectQuickNav}
                        highlightRegex={highlightRegex}
                        onRegisterAnchor={registerAnchor}
                      />
                    )}
                  </View>

                  <GuideContactCard
                    onOpenEmail={() => openSupportEmail()}
                    onCopyEmail={copySupportEmail}
                    emailCopied={emailCopied}
                  />

                  <View style={styles.bottomSpacer} />
                </ScrollView>

                {showScrollTop && (
                  <GuideScrollTopButton
                    onPress={handleScrollToTop}
                    bottomInset={insets.bottom}
                  />
                )}
              </SafeAreaView>
            </Animated.View>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={mailHintVisible}
        onClose={dismissMailHint}
        title="אפליקציית הדוא״ל לא נפתחה"
        message="במכשירים מסוימים לא מתבצעת הפניה אוטומטית לאפליקציית הדוא״ל. באפשרותך להעתיק את הכתובת המופיעה מטה ולשלוח אלינו הודעה באופן ידני."
        emphasis={SUPPORT_EMAIL}
      />
    </>
  );
}

export default GuideModal;
