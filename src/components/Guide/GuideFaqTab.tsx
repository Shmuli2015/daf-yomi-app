import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { GuideFaqItemData } from './guideFaqData';
import { getGuideCategory, type GuideCategoryId } from './guideCategories';
import type { GuideCategoryCounts } from './guideFilters';
import GuidePopularTopics from './GuidePopularTopics';
import GuideCategoryPills from './GuideCategoryPills';
import GuideFaqList from './GuideFaqList';
import GuideGesturesCard from './GuideGesturesCard';
import { createGuideFaqTabStyles } from './GuideFaqTab.styles';

interface GuideFaqTabProps {
  items: GuideFaqItemData[];
  totalFaqCount: number;
  categoryCounts: GuideCategoryCounts;
  activeCategoryId: GuideCategoryId | null;
  onSelectCategory: (categoryId: GuideCategoryId | null) => void;
  onSelectPopularTopic: (categoryId: GuideCategoryId, faqId: string) => void;
  hasSearch: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  guideResultCount: number;
  onSwitchToGuide: () => void;
  onAskSupport: (subject: string) => void;
  isItemExpanded: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
  noneExpanded: boolean;
  highlightRegex?: RegExp | null;
  onRegisterAnchor?: (id: string, event: LayoutChangeEvent) => void;
}

export function GuideFaqTab({
  items,
  totalFaqCount,
  categoryCounts,
  activeCategoryId,
  onSelectCategory,
  onSelectPopularTopic,
  hasSearch,
  searchQuery,
  onClearSearch,
  guideResultCount,
  onSwitchToGuide,
  onAskSupport,
  isItemExpanded,
  onToggleItem,
  onExpandAll,
  onCollapseAll,
  allExpanded,
  noneExpanded,
  highlightRegex,
  onRegisterAnchor,
}: GuideFaqTabProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideFaqTabStyles(theme), [theme]);
  const activeCategory = activeCategoryId ? getGuideCategory(activeCategoryId) : null;

  const handleResetCategory = useCallback(() => {
    onSelectCategory(null);
  }, [onSelectCategory]);

  return (
    <View style={styles.container}>
      {!hasSearch && activeCategoryId === null && (
        <GuidePopularTopics onSelectTopic={onSelectPopularTopic} />
      )}

      <GuideCategoryPills
        activeCategoryId={activeCategoryId}
        onSelectCategory={onSelectCategory}
        categoryCounts={categoryCounts}
        totalCount={totalFaqCount}
      />

      {activeCategory && !hasSearch && (
        <View style={styles.activeFilterBanner}>
          <View style={styles.activeFilterTextRow}>
            <Ionicons name="filter-outline" size={14} color={theme.colors.accent} />
            <Text style={styles.activeFilterText}>
              מציג שאלות בנושא: {activeCategory.label}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleResetCategory}
            style={styles.resetFilterBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="הצג את כל השאלות"
          >
            <Text style={styles.resetFilterText}>הצג הכל</Text>
          </TouchableOpacity>
        </View>
      )}

      <GuideFaqList
        items={items}
        hasSearch={hasSearch}
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
        guideResultCount={guideResultCount}
        onSwitchToGuide={onSwitchToGuide}
        onAskSupport={onAskSupport}
        isItemExpanded={isItemExpanded}
        onToggleItem={onToggleItem}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
        allExpanded={allExpanded}
        noneExpanded={noneExpanded}
        highlightRegex={highlightRegex}
        onRegisterAnchor={onRegisterAnchor}
      />

      {!hasSearch && <GuideGesturesCard />}
    </View>
  );
}

export default GuideFaqTab;
