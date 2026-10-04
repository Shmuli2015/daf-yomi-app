import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { GUIDE_SECTIONS } from './guideData';
import { triggerImpact } from '../../utils/haptics';
import { createGuideQuickNavStyles } from './GuideQuickNav.styles';

interface GuideQuickNavProps {
  onSelectSection: (sectionId: string) => void;
}

export function GuideQuickNav({ onSelectSection }: GuideQuickNavProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideQuickNavStyles(theme), [theme]);

  const handlePress = useCallback(
    (sectionId: string) => {
      triggerImpact('light');
      onSelectSection(sectionId);
    },
    [onSelectSection],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="list-outline" size={13} color={theme.colors.textMuted} />
        <Text style={styles.headerTitle}>קפיצה מהירה לנושא</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {GUIDE_SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.pill}
            onPress={() => handlePress(section.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`קפיצה אל ${section.title}`}
          >
            <Ionicons name={section.icon} size={14} color={theme.colors.accent} />
            <Text style={styles.label}>{section.shortTitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default GuideQuickNav;
