import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { triggerSelection } from '../../utils/haptics';
import AccordionSlideContent from '../AccordionSlideContent';
import { useGuideSectionAnimation } from '../Guide/useGuideSectionAnimation';
import { createSettingsCollapsibleCardStyles } from './SettingsCollapsibleCard.styles';

export type SettingsCollapsibleCardProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export default function SettingsCollapsibleCard({
  title,
  subtitle,
  icon,
  accentColor,
  isExpanded,
  onToggle,
  children,
}: SettingsCollapsibleCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsCollapsibleCardStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);
  const activeColor = accentColor ?? theme.colors.accent;

  const handlePress = () => {
    void triggerSelection();
    onToggle();
  };

  return (
    <View style={[styles.card, isExpanded && styles.cardOpen]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handlePress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${title}, ${subtitle ?? ''}`}
      >
        <View style={styles.headerStart}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: activeColor + '18',
                borderColor: activeColor + '40',
              },
            ]}
          >
            <Ionicons name={icon} size={20} color={activeColor} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <Animated.View style={animatedChevronStyle}>
            <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <AccordionSlideContent isExpanded={isExpanded}>
        <View style={styles.contentDivider} />
        <View style={styles.body}>{children}</View>
      </AccordionSlideContent>
    </View>
  );
}
