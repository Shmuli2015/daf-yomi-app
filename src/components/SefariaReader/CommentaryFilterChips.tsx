import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { triggerImpact } from '../../utils/haptics';
import { createCommentaryFilterChipsStyles } from './CommentaryFilterChips.styles';

export interface CommentaryFilterTab {
  id: string;
  label: string;
}

interface CommentaryFilterChipsProps {
  tabs: CommentaryFilterTab[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  accentColor: string;
}

export default function CommentaryFilterChips({
  tabs,
  activeTab,
  onSelectTab,
  accentColor,
}: CommentaryFilterChipsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createCommentaryFilterChipsStyles(theme), [theme]);

  const handlePress = (tabId: string) => {
    triggerImpact('light');
    onSelectTab(tabId);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.chip,
              isActive && [styles.chipActive, { backgroundColor: accentColor, borderColor: accentColor }],
            ]}
            onPress={() => handlePress(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {`\u200F${tab.label}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
