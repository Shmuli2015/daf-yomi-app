import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SefariaCommentaryItem } from '../../services/sefariaTextApi';
import { useTheme } from '../../theme';
import CommentaryFilterChips from './CommentaryFilterChips';
import InlineCommentaryCard from './InlineCommentaryCard';
import { buildCommentaryFilterTabs } from '../../utils/commentaryFilters';
import { createInlineCommentarySectionStyles } from './InlineCommentarySection.styles';

interface InlineCommentarySectionProps {
  commentaries: SefariaCommentaryItem[];
  fontSize: number;
  accentColor: string;
  isSepia?: boolean;
}

export default function InlineCommentarySection({
  commentaries,
  fontSize,
  accentColor,
  isSepia,
}: InlineCommentarySectionProps) {
  const theme = useTheme();
  const styles = useMemo(() => createInlineCommentarySectionStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<string>('all');

  const filterTabs = useMemo(() => buildCommentaryFilterTabs(commentaries), [commentaries]);

  const filteredCommentaries = useMemo(() => {
    if (activeTab === 'all') return commentaries;
    return commentaries.filter((item) => item.commentator === activeTab);
  }, [commentaries, activeTab]);

  const subTextColor = isSepia ? '#8C7462' : theme.colors.textMuted;
  const guideLineColor = isSepia ? '#D4B996' : `${accentColor}4D`;

  return (
    <View style={[styles.container, { borderRightColor: guideLineColor }]}>
      {filterTabs.length > 2 && (
        <CommentaryFilterChips
          tabs={filterTabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          accentColor={accentColor}
        />
      )}

      {filteredCommentaries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="information-circle-outline" size={24} color={subTextColor} />
          <Text style={[styles.emptyText, { color: subTextColor }]}>
            לא נמצאו פירושים עבור מסנן זה
          </Text>
        </View>
      ) : (
        <View style={styles.commentaryList}>
          {filteredCommentaries.map((item, idx) => (
            <InlineCommentaryCard
              key={`${item.commentator}-${idx}`}
              item={item}
              accentColor={accentColor}
              fontSize={fontSize}
              isSepia={isSepia}
            />
          ))}
        </View>
      )}
    </View>
  );
}
