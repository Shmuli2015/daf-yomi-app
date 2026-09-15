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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { SUPPORT_EMAIL, getSupportMailtoUrl } from '../../supportContact';
import InfoModal from '../InfoModal';
import GuideSection from './GuideSection';
import GuideItemText from './GuideItemText';
import { GUIDE_SECTIONS, FAQ_CHIPS } from './guideData';
import { createGuideModalStyles } from './GuideModal.styles';
import { useSheetDismissGesture } from '../../hooks/useSheetDismissGesture';
import SheetDragHandle from '../SheetDragHandle';

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export function GuideModal({ visible, onClose }: GuideModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideModalStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const heldTopInsetRef = useRef(insets.top);
  if (insets.top > 0) {
    heldTopInsetRef.current = insets.top;
  }
  const { panHandlers, sheetAnimatedStyle, overlayAnimatedStyle, animationType, dismiss } =
    useSheetDismissGesture({ visible, onClose });
  const chipsScrollRef = useRef<ScrollView>(null);
  const [mailHintVisible, setMailHintVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  const scrollChipsToStart = useCallback(() => {
    requestAnimationFrame(() => {
      chipsScrollRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  useEffect(() => {
    if (visible) {
      scrollChipsToStart();
    }
  }, [visible, scrollChipsToStart]);

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() =>
    GUIDE_SECTIONS.reduce((acc, sec) => {
      acc[sec.id] = true;
      return acc;
    }, {} as Record<string, boolean>),
  );

  const openSupportEmail = useCallback(async () => {
    try {
      await Linking.openURL(getSupportMailtoUrl());
    } catch {
      setMailHintVisible(true);
    }
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedMap(
      GUIDE_SECTIONS.reduce((acc, sec) => {
        acc[sec.id] = true;
        return acc;
      }, {} as Record<string, boolean>),
    );
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedMap({});
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

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.textMuted}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="חפש במדריך..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (activeChipId) setActiveChipId(null);
                }}
              />
              {hasSearch && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setActiveChipId(null);
                  }}
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
                    <Text style={styles.faqChipEmoji}>{chip.emoji}</Text>
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
                    color={theme.colors.accent}
                  />
                  <Text style={styles.controlBtnText}>פתח הכל</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCollapseAll}
                  style={styles.controlBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="contract-outline"
                    size={14}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.controlBtnTextMuted}>סגור הכל</Text>
                </TouchableOpacity>
              </View>
            )}

            {hasSearch && (
              <View style={styles.searchResultsInfo}>
                <Text style={styles.searchResultsText}>
                  נמצאו {filteredSections.reduce((acc, s) => acc + s.items.length, 0)} תוצאות עבור "{searchQuery}"
                </Text>
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
                  לא מצאנו נושאים המתאימים לחיפוש "{searchQuery}". נסה לחפש במילים אחרות.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setActiveChipId(null);
                  }}
                  style={styles.clearSearchBtn}
                >
                  <Text style={styles.clearSearchBtnText}>נקה חיפוש</Text>
                </TouchableOpacity>
              </View>
            )}

            {filteredSections.map((sec) => (
              <GuideSection
                key={sec.id}
                icon={sec.icon}
                title={sec.title}
                items={sec.items}
                theme={theme}
                isExpanded={hasSearch || !!expandedMap[sec.id]}
                onToggle={() => toggleSection(sec.id)}
                searchQuery={searchQuery}
              />
            ))}

            <View style={styles.contactBox}>
              <View style={styles.contactHeader}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={theme.colors.accent}
                  />
                </View>
                <Text style={styles.contactTitle}>יצירת קשר ותמיכה</Text>
              </View>
              <Text style={styles.contactIntro}>
                למשוב, תמיכה טכנית או הצעות לשיפור, ניתן ללחוץ על הכתובת הבאה לפתיחה מהירה באפליקציית הדוא"ל:
              </Text>
              <TouchableOpacity onPress={openSupportEmail} activeOpacity={0.75}>
                <Text style={styles.contactEmail} selectable>
                  {SUPPORT_EMAIL}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerCard}>
              <LinearGradient
                colors={[theme.colors.accent + '14', theme.colors.surface]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.footerGradient}
                pointerEvents="none"
              />

              <View style={styles.footerIconHalo}>
                <Ionicons name="sparkles" size={22} color={theme.colors.accent} />
              </View>

              <Text style={styles.footerCardTitle}>גישה מהירה ומידע נוסף</Text>

              <View style={styles.footerTextContainer}>
                <GuideItemText
                  text="ניתן לפתוח מדריך זה מחדש בכל עת דרך כפתור [[מדריך לשימוש באפליקציה]] בתחתית מסך הבית או דרך [[מדריך שימוש]] במסך ההגדרות. כמו כן, במסך ההגדרות תוכלו לבדוק אם קיימים עדכונים חדשים, לנהל קבצים שמורים, ולצפות בפרטי הגרסה שבתחתית המסך."
                  baseStyle={styles.footerText}
                  boldStyle={styles.footerTextBold}
                  theme={theme}
                />
              </View>

              <View style={styles.footerDividerRow}>
                <View style={styles.footerDividerLine} />
                <Ionicons name="book-outline" size={12} color={theme.colors.accent} />
                <View style={styles.footerDividerLine} />
              </View>

              <View style={styles.footerWishBadge}>
                <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
                <Text style={styles.footerWishText}>לימוד פורה ומאיר בש״ס!</Text>
              </View>
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
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
