import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useGuideSectionAnimation } from '../Settings/useGuideSectionAnimation';
import { createPersonalSederDropdownStyles } from './personalSederDropdownStyles';
import AccordionSlideContent from '../AccordionSlideContent';

interface PersonalSederDropdownProps {
  sederName: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function PersonalSederDropdown({
  sederName,
  isExpanded,
  onToggle,
  children,
}: PersonalSederDropdownProps) {
  const theme = useTheme();
  const styles = useMemo(() => createPersonalSederDropdownStyles(theme), [theme]);
  const { animatedChevronStyle } = useGuideSectionAnimation(isExpanded);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.headerTouchable}
      >
        <Text style={styles.title}>סדר {sederName}</Text>
        <Animated.View style={animatedChevronStyle}>
          <Ionicons
            name="chevron-down-outline"
            size={20}
            color={theme.colors.textMuted}
          />
        </Animated.View>
      </TouchableOpacity>

      <AccordionSlideContent isExpanded={isExpanded}>
        <View style={styles.content}>{children}</View>
      </AccordionSlideContent>
    </View>
  );
}
