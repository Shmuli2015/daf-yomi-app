import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import AccordionSlideContent from '../AccordionSlideContent';
import GuideItemText from './GuideItemText';
import HighlightedText from '../Settings/HighlightedText';
import { useGuideSectionAnimation } from './useGuideSectionAnimation';
import { createGuideFaqItemStyles } from './GuideFaqItem.styles';

interface GuideFaqItemProps {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  searchQuery?: string;
}

const GuideFaqItem = React.memo(function GuideFaqItem({
  id,
  icon,
  category,
  question,
  answer,
  isExpanded,
  onToggle,
  searchQuery = '',
}: GuideFaqItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideFaqItemStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const handlePress = useCallback(() => {
    onToggle(id);
  }, [id, onToggle]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.headerTouchable}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color={theme.colors.accent} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.categoryText}>{category}</Text>
          {searchQuery ? (
            <HighlightedText
              text={question}
              highlight={searchQuery}
              baseStyle={styles.questionText}
              highlightStyle={styles.questionHighlight}
            />
          ) : (
            <Text style={styles.questionText}>{question}</Text>
          )}
        </View>

        <Animated.View style={animatedChevronStyle}>
          <Ionicons
            name="chevron-down-outline"
            size={20}
            color={theme.colors.textMuted}
          />
        </Animated.View>
      </TouchableOpacity>

      <AccordionSlideContent isExpanded={isExpanded}>
        <View style={styles.answerContainer}>
          <GuideItemText
            text={answer}
            baseStyle={styles.answerText}
            boldStyle={styles.answerTextBold}
            theme={theme}
            searchQuery={searchQuery}
          />
        </View>
      </AccordionSlideContent>
    </View>
  );
});

export default GuideFaqItem;
