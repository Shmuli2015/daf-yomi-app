import React, { useMemo, useCallback } from 'react';
import { View, TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import AccordionSlideContent from '../AccordionSlideContent';
import GuideItemText from './GuideItemText';
import { useGuideSectionAnimation } from './useGuideSectionAnimation';
import { triggerImpact } from '../../utils/haptics';
import { createGuideFaqItemStyles } from './GuideFaqItem.styles';

interface GuideFaqItemProps {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  highlightRegex?: RegExp | null;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const GuideFaqItem = React.memo(function GuideFaqItem({
  id,
  icon,
  question,
  answer,
  isExpanded,
  onToggle,
  highlightRegex,
  onLayout,
}: GuideFaqItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideFaqItemStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const handlePress = useCallback(() => {
    triggerImpact('light');
    onToggle(id);
  }, [id, onToggle]);

  return (
    <View
      style={[styles.card, isExpanded && styles.cardExpanded]}
      onLayout={onLayout}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.headerTouchable, isExpanded && styles.headerExpanded]}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color={theme.colors.accent} />
        </View>

        <View style={styles.textContainer}>
          <GuideItemText
            text={question}
            baseStyle={styles.questionText}
            boldStyle={styles.questionText}
            theme={theme}
            highlightRegex={highlightRegex}
          />
        </View>

        <Animated.View style={animatedChevronStyle}>
          <Ionicons
            name="chevron-down-outline"
            size={18}
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
            highlightRegex={highlightRegex}
          />
        </View>
      </AccordionSlideContent>
    </View>
  );
});

export default GuideFaqItem;
