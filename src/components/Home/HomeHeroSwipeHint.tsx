import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createHomeHeroSwipeHintStyles } from './HomeHeroSwipeHint.styles';

const HomeHeroSwipeHint = React.memo(function HomeHeroSwipeHint() {
  const theme = useTheme();
  const styles = useMemo(() => createHomeHeroSwipeHintStyles(theme), [theme]);

  return (
    <View
      style={styles.container}
      pointerEvents="none"
      accessible
      accessibilityRole="text"
      accessibilityLabel="החלק ימינה או שמאלה למעבר בין ימים"
    >
      <View style={styles.row}>
        <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.activeDot} />
          <View style={styles.dot} />
        </View>
        <Ionicons name="chevron-back" size={14} color={theme.colors.textSecondary} />
      </View>
      <Text style={styles.label}>החלק ליום אחר</Text>
    </View>
  );
});

export default HomeHeroSwipeHint;
