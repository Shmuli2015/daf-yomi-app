import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import {
  GUIDE_CATEGORIES,
  type GuideCategoryId,
} from './guideCategories';
import type { GuideCategoryCounts } from './guideFilters';
import { triggerImpact } from '../../utils/haptics';
import { createGuideCategoryPillsStyles } from './GuideCategoryPills.styles';

interface GuideCategoryPillsProps {
  activeCategoryId: GuideCategoryId | null;
  onSelectCategory: (categoryId: GuideCategoryId | null) => void;
  categoryCounts: GuideCategoryCounts;
  totalCount: number;
}

export function GuideCategoryPills({
  activeCategoryId,
  onSelectCategory,
  categoryCounts,
  totalCount,
}: GuideCategoryPillsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideCategoryPillsStyles(theme), [theme]);

  const handleSelect = useCallback(
    (categoryId: GuideCategoryId | null) => {
      triggerImpact('light');
      onSelectCategory(activeCategoryId === categoryId ? null : categoryId);
    },
    [activeCategoryId, onSelectCategory],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.pill, activeCategoryId === null && styles.pillActive]}
          onPress={() => handleSelect(null)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: activeCategoryId === null }}
          accessibilityLabel={`הכל, ${totalCount} שאלות`}
        >
          <Ionicons
            name="apps-outline"
            size={14}
            color={activeCategoryId === null ? theme.colors.accent : theme.colors.textSecondary}
          />
          <Text style={[styles.label, activeCategoryId === null && styles.labelActive]}>
            הכל
          </Text>
          <View style={[styles.badge, activeCategoryId === null && styles.badgeActive]}>
            <Text
              style={[
                styles.badgeText,
                activeCategoryId === null && styles.badgeTextActive,
              ]}
            >
              {totalCount}
            </Text>
          </View>
        </TouchableOpacity>

        {GUIDE_CATEGORIES.map((category) => {
          const isSelected = activeCategoryId === category.id;
          const count = categoryCounts[category.id] ?? 0;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => handleSelect(category.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${category.label}, ${count} שאלות`}
            >
              <Ionicons
                name={category.icon}
                size={14}
                color={isSelected ? theme.colors.accent : theme.colors.textSecondary}
              />
              <Text style={[styles.label, isSelected && styles.labelActive]}>
                {category.label}
              </Text>
              <View style={[styles.badge, isSelected && styles.badgeActive]}>
                <Text style={[styles.badgeText, isSelected && styles.badgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default GuideCategoryPills;
