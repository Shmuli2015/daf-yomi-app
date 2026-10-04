import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import {
  GUIDE_POPULAR_TOPICS,
  type GuideCategoryId,
  type GuidePopularTopic,
} from './guideCategories';
import { triggerImpact } from '../../utils/haptics';
import { createGuidePopularTopicsStyles } from './GuidePopularTopics.styles';

interface GuidePopularTopicsProps {
  onSelectTopic: (categoryId: GuideCategoryId, faqId: string) => void;
}

export function GuidePopularTopics({ onSelectTopic }: GuidePopularTopicsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuidePopularTopicsStyles(theme), [theme]);

  const handlePress = useCallback(
    (topic: GuidePopularTopic) => {
      triggerImpact('light');
      onSelectTopic(topic.categoryId, topic.faqId);
    },
    [onSelectTopic],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
        <Text style={styles.headerTitle}>נושאים מובילים</Text>
      </View>
      <View style={styles.grid}>
        {GUIDE_POPULAR_TOPICS.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.card}
            onPress={() => handlePress(topic)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${topic.label}, ${topic.hint}`}
          >
            <View style={styles.iconBox}>
              <Ionicons name={topic.icon} size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.label} numberOfLines={1}>
                {topic.label}
              </Text>
              <Text style={styles.hint} numberOfLines={1}>
                {topic.hint}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default GuidePopularTopics;
