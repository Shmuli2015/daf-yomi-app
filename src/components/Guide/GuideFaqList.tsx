import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { GuideFaqItemData } from './guideFaqData';
import GuideFaqItem from './GuideFaqItem';
import { useGuideFaqState } from './useGuideFaqState';
import { createGuideFaqListStyles } from './GuideFaqList.styles';

interface GuideFaqListProps {
  items: GuideFaqItemData[];
  hasSearch: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

export function GuideFaqList({
  items,
  hasSearch,
  searchQuery,
  onClearSearch,
}: GuideFaqListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideFaqListStyles(theme), [theme]);

  const {
    toggleFaq,
    handleExpandAllFaq,
    handleCollapseAllFaq,
    allFaqExpanded,
    noneFaqExpanded,
    isFaqExpanded,
  } = useGuideFaqState(items, hasSearch, searchQuery);

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="help-circle-outline"
          size={48}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyTitle}>לא נמצאו שאלות מתאימות</Text>
        <Text style={styles.emptySubtitle}>
          לא מצאנו שאלות ותשובות המתאימות לחיפוש "{searchQuery}". נסה לחפש במילים אחרות או לעבור ללשונית "מדריך מפורט".
        </Text>
        <TouchableOpacity
          onPress={onClearSearch}
          style={styles.clearSearchBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.clearSearchBtnText}>נקה חיפוש</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!hasSearch && (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handleExpandAllFaq}
            style={styles.controlBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="expand-outline"
              size={14}
              color={allFaqExpanded ? theme.colors.textMuted : theme.colors.accent}
            />
            <Text style={allFaqExpanded ? styles.controlBtnTextMuted : styles.controlBtnText}>
              פתח הכל
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCollapseAllFaq}
            style={styles.controlBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="contract-outline"
              size={14}
              color={noneFaqExpanded ? theme.colors.textMuted : theme.colors.accent}
            />
            <Text style={noneFaqExpanded ? styles.controlBtnTextMuted : styles.controlBtnText}>
              סגור הכל
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {items.map((item) => (
        <GuideFaqItem
          key={item.id}
          id={item.id}
          icon={item.icon}
          category={item.category}
          question={item.question}
          answer={item.answer}
          isExpanded={isFaqExpanded(item.id)}
          onToggle={toggleFaq}
          searchQuery={searchQuery}
        />
      ))}
    </View>
  );
}

export default GuideFaqList;
