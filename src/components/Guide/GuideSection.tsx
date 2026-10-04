import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import AccordionSlideContent from '../AccordionSlideContent';
import { useGuideSectionAnimation } from './useGuideSectionAnimation';
import GuideSectionItem from './GuideSectionItem';
import { createGuideSectionStyles } from './GuideSection.styles';

interface GuideSectionProps {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  items: string[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  highlightRegex?: RegExp | null;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const GuideSection = React.memo(function GuideSection({
  id,
  icon,
  title,
  subtitle,
  items,
  isExpanded,
  onToggle,
  highlightRegex,
  onLayout,
}: GuideSectionProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideSectionStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  const handlePress = useCallback(() => {
    onToggle(id);
  }, [id, onToggle]);

  return (
    <View style={styles.card} onLayout={onLayout}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.headerTouchable}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
        <Animated.View style={animatedChevronStyle}>
          <Ionicons name="chevron-down-outline" size={18} color={theme.colors.textMuted} />
        </Animated.View>
      </TouchableOpacity>

      <AccordionSlideContent isExpanded={isExpanded}>
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <GuideSectionItem
              key={index}
              item={item}
              index={index}
              highlightRegex={highlightRegex}
              isLast={index === items.length - 1}
            />
          ))}
        </View>
      </AccordionSlideContent>
    </View>
  );
});

export default GuideSection;
