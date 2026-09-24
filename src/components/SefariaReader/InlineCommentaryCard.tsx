import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import type { SefariaCommentaryItem } from '../../services/sefariaTextApi';
import { useTheme } from '../../theme';
import CommentaryBodyText from './CommentaryBodyText';
import { createInlineCommentaryCardStyles } from './InlineCommentaryCard.styles';

interface InlineCommentaryCardProps {
  item: SefariaCommentaryItem;
  accentColor: string;
  fontSize: number;
  isSepia?: boolean;
  isDark?: boolean;
}

export default function InlineCommentaryCard({
  item,
  accentColor,
  fontSize,
  isSepia,
  isDark,
}: InlineCommentaryCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createInlineCommentaryCardStyles(theme), [theme]);

  const textColor = isSepia ? '#2C221E' : isDark ? '#FFFFFF' : '#0F172A';
  const commentaryFontSize = Math.max(13, fontSize - 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.commentatorTitle, { color: accentColor }]}>
          {`\u200F${item.titleHe}`}
        </Text>
      </View>
      <CommentaryBodyText
        text={item.he}
        commentator={item.commentator}
        baseStyle={[
          styles.text,
          {
            color: textColor,
            fontSize: commentaryFontSize,
            lineHeight: Math.round(commentaryFontSize * 1.55),
          },
        ]}
        accentColor={accentColor}
      />
    </View>
  );
}
