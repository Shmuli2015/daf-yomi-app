import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createChavrutaFootnoteNavStyles } from './ChavrutaFootnoteNav.styles';

interface ChavrutaFootnoteNavProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function ChavrutaFootnoteNav({
  currentIndex,
  total,
  onPrev,
  onNext,
}: ChavrutaFootnoteNavProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaFootnoteNavStyles(theme), [theme]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.navBtn, !hasPrev && styles.navBtnDisabled]}
        onPress={onPrev}
        disabled={!hasPrev}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="הערה קודמת"
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={hasPrev ? theme.colors.accent : theme.colors.textMuted}
        />
      </TouchableOpacity>

      <Text style={styles.label}>
        {`\u200Fהערה ${currentIndex + 1} מתוך ${total}`}
      </Text>

      <TouchableOpacity
        style={[styles.navBtn, !hasNext && styles.navBtnDisabled]}
        onPress={onNext}
        disabled={!hasNext}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="הערה הבאה"
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={hasNext ? theme.colors.accent : theme.colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}
