import React, { useMemo } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { GuideFaqItemData } from './guideFaqData';
import { getGuideCategory } from './guideCategories';
import { groupFaqItemsByCategory } from './guideFilters';
import GuideFaqItem from './GuideFaqItem';
import GuideEmptyState from './GuideEmptyState';
import GuideExpandControls from './GuideExpandControls';
import { createGuideFaqListStyles } from './GuideFaqList.styles';

interface GuideFaqListProps {
  items: GuideFaqItemData[];
  hasSearch: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  guideResultCount?: number;
  onSwitchToGuide?: () => void;
  onAskSupport?: (subject: string) => void;
  isItemExpanded: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
  noneExpanded: boolean;
  highlightRegex?: RegExp | null;
  onRegisterAnchor?: (id: string, event: LayoutChangeEvent) => void;
}

export function GuideFaqList({
  items,
  hasSearch,
  searchQuery,
  onClearSearch,
  guideResultCount = 0,
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
}: GuideFaqListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideFaqListStyles(theme), [theme]);
  const groups = useMemo(() => groupFaqItemsByCategory(items), [items]);

  if (items.length === 0) {
    return (
      <GuideEmptyState
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
        otherTabLabel="מדריך מפורט"
        otherTabCount={guideResultCount}
        onSwitchTab={onSwitchToGuide}
        onAskSupport={onAskSupport}
      />
    );
  }

  return (
    <View style={styles.container}>
      {!hasSearch && (
        <GuideExpandControls
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          allExpanded={allExpanded}
          noneExpanded={noneExpanded}
        />
      )}

      {groups.map((group) => {
        const category = getGuideCategory(group.categoryId);
        return (
          <View key={group.categoryId} style={styles.categoryGroup}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIconBox}>
                <Ionicons name={category.icon} size={13} color={theme.colors.accent} />
              </View>
              <Text style={styles.groupTitle}>{category.label}</Text>
              <View style={styles.groupDivider} />
              <Text style={styles.groupCount}>{group.items.length}</Text>
            </View>

            {group.items.map((item) => (
              <GuideFaqItem
                key={item.id}
                id={item.id}
                icon={item.icon}
                question={item.question}
                answer={item.answer}
                isExpanded={isItemExpanded(item.id)}
                onToggle={onToggleItem}
                highlightRegex={highlightRegex}
                onLayout={
                  onRegisterAnchor
                    ? (event) => onRegisterAnchor(item.id, event)
                    : undefined
                }
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default GuideFaqList;
