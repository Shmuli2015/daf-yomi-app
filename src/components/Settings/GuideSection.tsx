import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import GuideItemText from './GuideItemText';
import { createGuideModalStyles } from './GuideModal.styles';
import { useGuideSectionAnimation } from './useGuideSectionAnimation';
import AccordionSlideContent from '../AccordionSlideContent';

interface GuideSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
  theme: ReturnType<typeof useTheme>;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

export default function GuideSection({
  icon,
  title,
  items,
  theme,
  isExpanded,
  onToggle,
  searchQuery = '',
}: GuideSectionProps) {
  const styles = useMemo(() => createGuideModalStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.sectionHeaderTouchable}
      >
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={theme.colors.accent} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCountText}>{items.length} נושאים</Text>
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
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.bullet} />
              <GuideItemText
                text={item}
                baseStyle={styles.itemText}
                boldStyle={styles.itemTextBold}
                theme={theme}
                searchQuery={searchQuery}
              />
            </View>
          ))}
        </View>
      </AccordionSlideContent>
    </View>
  );
}
