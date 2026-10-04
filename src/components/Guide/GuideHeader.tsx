import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createGuideHeaderStyles } from './GuideHeader.styles';

interface GuideHeaderProps {
  onClose: () => void;
  faqCount: number;
  categoryCount: number;
}

export function GuideHeader({ onClose, faqCount, categoryCount }: GuideHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideHeaderStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <Ionicons name="book-outline" size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>מדריך ומרכז עזרה</Text>
          <Text style={styles.subtitle}>
            {faqCount} שאלות נפוצות · {categoryCount} נושאים
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="סגירת המדריך"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

export default GuideHeader;
