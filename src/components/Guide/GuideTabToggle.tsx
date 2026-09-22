import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useModeSwitcherIndicator } from '../../hooks/useModeSwitcherIndicator';
import { createGuideTabToggleStyles } from './GuideTabToggle.styles';

export type GuideTabType = 'faq' | 'guide';

interface GuideTabToggleProps {
  activeTab: GuideTabType;
  onSelectTab: (tab: GuideTabType) => void;
  faqCount?: number;
  guideCount?: number;
  hasSearch?: boolean;
}

const TABS: Array<{ id: GuideTabType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'guide', label: 'מדריך מפורט', icon: 'book-outline' },
  { id: 'faq', label: 'שאלות נפוצות', icon: 'help-circle-outline' },
];

const TAB_IDS = TABS.map((tab) => tab.id);

export function GuideTabToggle({
  activeTab,
  onSelectTab,
  faqCount,
  guideCount,
  hasSearch = false,
}: GuideTabToggleProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideTabToggleStyles(theme), [theme]);
  const { onSwitcherLayout, indicatorStyle, isReady } = useModeSwitcherIndicator(
    activeTab,
    TAB_IDS,
  );

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl} onLayout={onSwitcherLayout}>
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'faq' ? faqCount : guideCount;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isActive && !isReady && styles.tabBtnActiveFallback]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? theme.colors.white : theme.colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {hasSearch && typeof count === 'number' && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default GuideTabToggle;
